# STEP 2 - Authentication Testing Guide (Postman)

## Prerequisites
1. Application running on `http://localhost:8081`
2. PostgreSQL database initialized
3. Postman installed

---

## Setup Options

You can test the application using either pre-existing test users OR by registering new users via the API.

### ✅ Option 1: Use Pre-Existing Test Users (Recommended)

Run the initialization script to create test tenants and users:

```bash
# Via Docker:
docker exec -i notesapp-postgres psql -U postgres -d notesapp_db < init-data.sql

# Or locally:
psql -U postgres -d notesapp_db -f init-data.sql
```

This creates:
- **Tenant 1 (PRO)**: admin@test.com / password123 (ADMIN role)
- **Tenant 2 (FREE)**: user@another.com / password123 (MEMBER role)

### ✅ Option 2: Register New Users via API

**For Tenant 2 (FREE plan - max 3 notes) - DEFAULT:**
```json
POST http://localhost:8081/auth/register
Content-Type: application/json

{
    "email": "test1@example.com",
    "password": "password123"
}
```

**For Tenant 1 (PRO plan - unlimited notes) - REQUIRES INVITE CODE:**
```json
POST http://localhost:8081/auth/register
Content-Type: application/json

{
    "email": "test2@example.com",
    "password": "password123",
    "inviteCode": "TENANT1_PRO_INVITE"
}
```

---

## Test Data (After Setup Option 1)

### Tenant 1: Test Company (PRO)
- **User:** admin@test.com
- **Password:** password123
- **Role:** ADMIN
- **Tenant ID:** 1
- **Subscription:** PRO (unlimited notes)

### Tenant 2: Another Company (FREE)
- **User:** user@another.com
- **Password:** password123
- **Role:** MEMBER
- **Tenant ID:** 2
- **Subscription:** FREE (max 3 notes per user)

---

## TEST 1: Login - Get JWT Token ✅

### Request (Valid Credentials)
```
POST http://localhost:8081/auth/login
Content-Type: application/json

Body (JSON):
{
    "email": "admin@test.com",
    "password": "password123"
}
```

### Expected Response
```
HTTP 200 OK
Content-Type: text/plain

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInRlbmFudElkIjoxLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDM...
```

**This is your JWT token!** Copy it for the next tests.

### What to Verify
✅ Status code is 200
✅ Response is a long string (JWT token)
✅ Token contains 3 parts separated by dots (header.payload.signature)

---

## TEST 1B: Login - Invalid Password ❌ (Must Fail)

### Request (Wrong Password)
```
POST http://localhost:8081/auth/login
Content-Type: application/json

Body (JSON):
{
    "email": "admin@test.com",
    "password": "wrongpassword123"
}
```

### Expected Response
```
HTTP 401 Unauthorized
Content-Type: text/plain

Invalid credentials
```

### What to Verify
✅ Status code is 401 (not 200)
✅ Generic error message (doesn't reveal if user exists)
✅ Password validation is working!

---

## TEST 2: Access Protected Endpoint WITH Token ✅

### Request
```
GET http://localhost:8081/api/notes
Authorization: Bearer <YOUR_JWT_TOKEN_FROM_TEST_1>
```

### How to Add in Postman
1. Create new GET request to `http://localhost:8081/api/notes`
2. Go to **Authorization** tab
3. Select **Type:** Bearer Token
4. Paste your JWT token in the **Token** field

### Expected Response
```
HTTP 200 OK
Content-Type: application/json

[
    // Notes belonging to tenant 1 (if any exist)
]
```

### What to Verify
✅ Status code is 200 (not 401)
✅ Request goes through successfully
✅ Only notes from tenant 1 are returned

---

## TEST 3: Access Protected Endpoint WITHOUT Token ❌ (Must Fail)

### Request
```
GET http://localhost:8081/api/notes
(NO Authorization header)
```

### How to Test in Postman
1. Create new GET request to `http://localhost:8081/api/notes`
2. Go to **Authorization** tab
3. Select **Type:** No Auth
4. Send request

### Expected Response
```
HTTP 401 Unauthorized
```

### What to Verify
✅ Status code is 401
✅ Request is rejected
✅ This proves authentication is working!

---

## TEST 4: Login with Second User (Different Tenant)

### Request
```
POST http://localhost:8081/auth/login
Content-Type: application/json

Body (JSON):
{
    "email": "user@another.com",
    "password": "password123"
}
```

### Expected Response
```
HTTP 200 OK

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsInRlbmFudElkIjoyLCJyb2xlIjoiTUVNQkVSIiwiaWF0IjoxNzAz...
```

**This token contains Tenant ID = 2**

### What to Verify
✅ Different token from Test 1
✅ This token will only access tenant 2's data

---

## TEST 5: Create Note with Tenant 1 Token

### Request
```
POST http://localhost:8081/api/notes
Authorization: Bearer <TENANT_1_TOKEN>
Content-Type: application/json

Body (JSON):
{
    "title": "Tenant 1 Note",
    "content": "This belongs to Test Company"
}
```

### Expected Response
```
HTTP 200/201 OK
Content-Type: application/json

{
    "id": 1,
    "title": "Tenant 1 Note",
    "content": "This belongs to Test Company",
    "tenantId": 1,
    "createdBy": 1,
    "createdAt": "2025-12-20T...",
    "updatedAt": "2025-12-20T..."
}
```

### What to Verify
✅ Note is created
✅ `tenantId` is automatically set to 1 (from JWT)
✅ `createdBy` is automatically set to 1 (user ID from JWT)

---

## TEST 6: Verify Tenant Isolation

### Step 1: Create note with Tenant 1 token (from Test 5)
### Step 2: Get all notes with Tenant 2 token

```
GET http://localhost:8081/api/notes
Authorization: Bearer <TENANT_2_TOKEN>
```

### Expected Response
```
HTTP 200 OK
Content-Type: application/json

[
    // Empty array OR only tenant 2's notes
    // Tenant 1's note should NOT appear here!
]
```

### What to Verify
✅ Tenant 2 user CANNOT see Tenant 1's notes
✅ This proves tenant isolation is working!

---

## TEST 7: Invalid/Expired Token ❌ (Must Fail)

### Request
```
GET http://localhost:8081/api/notes
Authorization: Bearer invalid_token_12345
```

### Expected Response
```
HTTP 401 Unauthorized
```

### What to Verify
✅ Invalid token is rejected
✅ Security is properly enforced

---

## 🔐 IMPORTANT: Role Elevation Security Design

**⚠️ CRITICAL SECURITY NOTICE:**

Before testing ADMIN-only features, understand the security architecture:

- ✅ **Role elevation is intentionally NOT exposed via public API**
- ✅ **No REST endpoint exists to change MEMBER → ADMIN**
- ✅ **For testing purposes only:** Users are promoted to ADMIN directly in the database
- ✅ **In production:** Role management would be handled by:
  - Internal admin tooling (separate application)
  - Proper authentication and authorization for admins
  - Audit logging of all role changes
  - Approval workflows for privilege escalation

**Why This Design?**
- Prevents privilege escalation vulnerabilities
- Separates user self-service from administrative operations
- Follows principle of least privilege
- Production systems never expose role management via public APIs

**For This Assignment:**
- We manually update the database to test ADMIN features
- This simulates what an internal admin tool would do
- Reviewers can verify role-based authorization works correctly

---

## TEST 10: Tenant Upgrade - ADMIN Only ✅

### Setup
This test requires an ADMIN user on a FREE plan tenant.

**⚠️ SECURITY NOTE:** Role changes are NOT available via API. Use database updates for testing.

**Option 1: Promote existing Tenant 2 user to ADMIN (temporary for testing)**
```sql
-- Connect to database
docker exec -it notesapp-postgres psql -U postgres -d notesapp_db

-- Promote user
UPDATE users SET role = 'ADMIN' WHERE email = 'user@another.com';

-- Verify change
SELECT id, email, role, tenant_id FROM users WHERE email = 'user@another.com';
```

**Option 2: Register new user and promote**
```sql
-- After registering via /auth/register with TENANT2_INVITE
UPDATE users SET role = 'ADMIN' WHERE email = 'newadmin@test.com';
```

**Option 3: Use pre-existing ADMIN user on PRO plan**
```sql
-- Note: admin@test.com is on Tenant 1 (PRO plan)
-- To test upgrade, temporarily downgrade:
UPDATE tenants SET subscription_plan = 'FREE' WHERE id = 1;
-- (Remember to restore after testing)
```

---

### Test 10A: MEMBER User Cannot Upgrade (Must Fail)

```
PUT http://localhost:8081/api/tenants/upgrade
Authorization: Bearer <TENANT_2_MEMBER_TOKEN>
```

### Expected Response
```
HTTP 403 Forbidden
Content-Type: application/json

{
    "error": "Forbidden"
}
```

### What to Verify
✅ Status code is 403 (not 401 or 200)
✅ MEMBER role blocked from upgrading
✅ Access denied handler working

---

### Test 10B: ADMIN User Can Upgrade to PRO (Must Succeed)

**First, login as ADMIN on FREE plan tenant:**
```
POST http://localhost:8081/auth/login
Content-Type: application/json

Body (JSON):
{
    "email": "user@another.com",
    "password": "password123"
}
```
(Assuming you temporarily changed user@another.com to ADMIN role)

**Then upgrade:**
```
PUT http://localhost:8081/api/tenants/upgrade
Authorization: Bearer <ADMIN_FREE_TENANT_TOKEN>
```

### Expected Response
```
HTTP 200 OK
Content-Type: text/plain

Tenant successfully upgraded to PRO plan
```

### What to Verify
✅ Status code is 200
✅ Success message returned
✅ Tenant's subscription plan changed to PRO in database
✅ ADMIN role has upgrade permission

**Verify in Database:**
```sql
SELECT id, name, subscription_plan FROM tenants WHERE id = 2;
-- Should show: subscription_plan = 'PRO'
```

---

### Test 10C: Already PRO Returns Appropriate Message

**Try upgrading again:**
```
PUT http://localhost:8081/api/tenants/upgrade
Authorization: Bearer <ADMIN_PRO_TENANT_TOKEN>
```

### Expected Response
```
HTTP 200 OK
Content-Type: text/plain

Tenant already on PRO plan
```

### What to Verify
✅ Status code is 200 (not error)
✅ Idempotent behavior (safe to call multiple times)
✅ Clear message about current state

---

## Postman Collection Setup

### Collection Structure
```
Notes App - Multi-Tenant
├── Auth
│   ├── Register New User
│   ├── Login Tenant 1 (admin@test.com)
│   ├── Login Tenant 2 (user@another.com)
│   └── Login with Wrong Password (should fail)
├── Notes - Authenticated
│   ├── Get All Notes (with token)
│   ├── Create Note (with token)
│   ├── Get Note by ID (with token)
│   ├── Update Note (with token)
│   └── Delete Note (with token - ADMIN only)
├── Subscription Limits
│   ├── Create Note 1 (FREE plan)
│   ├── Create Note 2 (FREE plan)
│   ├── Create Note 3 (FREE plan)
│   └── Create Note 4 (should fail - HTTP 403)
├── Role-Based Authorization
│   ├── Delete as MEMBER (should fail - HTTP 403)
│   └── Delete as ADMIN (should succeed - HTTP 204)
├── Tenant Management (ADMIN only)
│   ├── Upgrade as MEMBER (should fail - HTTP 403)
│   ├── Upgrade as ADMIN on FREE (should succeed - HTTP 200)
│   └── Upgrade when already PRO (HTTP 200 with message)
└── Security Tests
    ├── Access without token (should fail)
    └── Access with invalid token (should fail)
```

### Environment Variables (Optional)
Create a Postman environment with:
- `baseUrl`: `http://localhost:8081`
- `tenant1Token`: (save after login)
- `tenant2Token`: (save after login)

---

## Expected Outcomes - CHECKPOINT

✅ **Login works** → Returns JWT token
✅ **Authenticated requests work** → With valid token
✅ **Unauthenticated requests fail** → Returns 401
✅ **Tenant isolation works** → Each tenant only sees their data
✅ **Token contains tenant context** → Automatically applied to all operations

---

## Troubleshooting

### Issue: Connection refused
- **Solution:** Make sure app is running: `mvn spring-boot:run`

### Issue: 401 on /auth/login
- **Solution:** Check SecurityConfig permits `/auth/**`

### Issue: Token validation fails
- **Solution:** Check JWT secret is properly configured

### Issue: User not found
- **Solution:** Run test-data.sql to insert test users

---

## Next Steps After Testing

Once all tests pass:
1. ✅ STEP 2 is COMPLETE
2. Move to STEP 3: Update NoteService to use TenantContext
3. Implement tenant filtering in all CRUD operations
4. Add role-based authorization (ADMIN vs MEMBER)

---

## Quick Postman Import (JSON)

Save this as `notesapp-tests.postman_collection.json`:

```json
{
  "info": {
    "name": "Notes App - Multi-Tenant (Complete)",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register New User",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"email\": \"newuser@example.com\",\n    \"password\": \"password123\"\n}"
            },
            "url": "http://localhost:8081/auth/register"
          }
        },
        {
          "name": "Login Tenant 1 (ADMIN)",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"email\": \"admin@test.com\",\n    \"password\": \"password123\"\n}"
            },
            "url": "http://localhost:8081/auth/login"
          }
        },
        {
          "name": "Login Tenant 2 (MEMBER)",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"email\": \"user@another.com\",\n    \"password\": \"password123\"\n}"
            },
            "url": "http://localhost:8081/auth/login"
          }
        },
        {
          "name": "Login - Wrong Password (Should Fail)",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"email\": \"admin@test.com\",\n    \"password\": \"wrongpassword\"\n}"
            },
            "url": "http://localhost:8081/auth/login"
          }
        }
      ]
    },
    {
      "name": "Notes - CRUD",
      "item": [
        {
          "name": "Get All Notes",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": "http://localhost:8081/api/notes"
          }
        },
        {
          "name": "Create Note",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"title\": \"Test Note\",\n    \"content\": \"Note content\"\n}"
            },
            "url": "http://localhost:8081/api/notes"
          }
        },
        {
          "name": "Delete Note (ADMIN Only)",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{adminToken}}"}],
            "url": "http://localhost:8081/api/notes/1"
          }
        }
      ]
    },
    {
      "name": "Security Tests",
      "item": [
        {
          "name": "Test Without Token (Should Fail)",
          "request": {
            "method": "GET",
            "header": [],
            "url": "http://localhost:8081/api/notes"
          }
        },
        {
          "name": "Delete as MEMBER (Should Fail)",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{memberToken}}"}],
            "url": "http://localhost:8081/api/notes/1"
          }
        }
      ]
    }
  ]
}
```

Import this into Postman: **File → Import → Paste JSON**

---

**Good luck with testing! 🚀**

