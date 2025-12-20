# STEP 2 - Authentication Testing Guide (Postman)

## Prerequisites
1. Application running on `http://localhost:8081`
2. PostgreSQL database with test data inserted
3. Postman installed

---

## Test Data (Already in Database)

### Tenant 1: Test Company (PRO)
- **User:** admin@test.com
- **Password:** password123
- **Role:** ADMIN
- **Tenant ID:** 1

### Tenant 2: Another Company (FREE)
- **User:** user@another.com
- **Password:** password123
- **Role:** MEMBER
- **Tenant ID:** 2

---

## TEST 1: Login - Get JWT Token ✅

### Request
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

## Postman Collection Setup

### Collection Structure
```
Notes App - Multi-Tenant
├── Auth
│   ├── Login Tenant 1 (admin@test.com)
│   └── Login Tenant 2 (user@another.com)
├── Notes - Authenticated
│   ├── Get All Notes (with token)
│   ├── Create Note (with token)
│   ├── Get Note by ID (with token)
│   ├── Update Note (with token)
│   └── Delete Note (with token)
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
    "name": "Notes App - Multi-Tenant",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login Tenant 1",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"email\": \"admin@test.com\",\n    \"password\": \"password123\"\n}"
            },
            "url": "http://localhost:8081/auth/login"
          }
        }
      ]
    },
    {
      "name": "Test Without Token (Should Fail)",
      "request": {
        "method": "GET",
        "header": [],
        "url": "http://localhost:8081/api/notes"
      }
    }
  ]
}
```

Import this into Postman: **File → Import → Paste JSON**

---

**Good luck with testing! 🚀**

