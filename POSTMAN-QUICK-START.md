# Quick Postman Testing - Copy & Paste Ready

## 📋 Available API Endpoints

### Authentication (No Token Required)
- ✅ POST `/auth/register` - Create new user & get token
- ✅ POST `/auth/login` - Login existing user & get token

### Notes Management (Token Required)
- ✅ POST `/api/notes` - Create note
- ✅ GET `/api/notes` - List all notes (tenant filtered)
- ✅ GET `/api/notes/{id}` - Get single note (tenant validated)
- ✅ PUT `/api/notes/{id}` - Update note (tenant validated)
- ✅ DELETE `/api/notes/{id}` - Delete note (tenant validated)

---

## ⚠️ FIRST TIME SETUP - Insert Test Data

**Run this ONCE before testing:**

```sql
-- In PostgreSQL (psql or pgAdmin):
INSERT INTO tenants (id, name, subscription_plan) VALUES (1, 'Test Company', 'PRO');
INSERT INTO tenants (id, name, subscription_plan) VALUES (2, 'Another Company', 'FREE');
INSERT INTO users (id, email, password, role, tenant_id) VALUES (1, 'admin@test.com', 'password123', 'ADMIN', 1);
INSERT INTO users (id, email, password, role, tenant_id) VALUES (2, 'user@another.com', 'password123', 'MEMBER', 2);
```

Or use PowerShell:
```powershell
# Set your local PostgreSQL password
$env:PGPASSWORD='your_postgres_password'; psql -U postgres -d notesapp_db -f test-data.sql
```

---

## 0️⃣ REGISTER (Create New User) - ⚠️ NOT RECOMMENDED FOR TESTING

**NOTE:** New registrations are automatically assigned to Tenant 1 (PRO plan). To test FREE plan limits, use the pre-existing `user@another.com` account instead.

```
POST http://localhost:8081/auth/register
Content-Type: application/json

{
    "email": "newuser@test.com",
    "password": "mypassword123"
}
```
✅ Returns JWT token immediately
⚠️ User automatically assigned to **Tenant 1 (PRO plan)** with **MEMBER role**

**Response:**
```
Status: 200 OK
Body: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjMsInRlbmFudElkIjoxLCJyb2xlIjoiTUVNQkVSIi... (JWT token)
```

**⚠️ IMPORTANT:** You registered `user@another.com` via the API, which overwrote the test data! This user is now on Tenant 1 instead of Tenant 2.

---

## 1️⃣ LOGIN (Get Token)
```
POST http://localhost:8081/auth/login
Content-Type: application/json

{
    "email": "admin@test.com",
    "password": "password123"
}
```
✅ Copy the token from response!

---

## 2️⃣ TEST WITH TOKEN (Should Work)
```
GET http://localhost:8081/api/notes
Authorization: Bearer YOUR_TOKEN_HERE
```
✅ Should return 200 OK

---

## 3️⃣ TEST WITHOUT TOKEN (Should Fail)
```
GET http://localhost:8081/api/notes
(No Authorization header)
```
✅ Should return 401 Unauthorized

---

## 4️⃣ CREATE NOTE WITH TOKEN
```
POST http://localhost:8081/api/notes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
    "title": "Test Note",
    "content": "This is my test note"
}
```
✅ Note should have tenantId=1 and createdBy=1

---

## 5️⃣ TEST SUBSCRIPTION LIMITS (FREE Plan Only)

**Login as Tenant 2 User (FREE plan):**
```
POST http://localhost:8081/auth/login
Content-Type: application/json

{
    "email": "user@another.com",
    "password": "password123"
}
```

**Create 3 notes successfully:**
```
POST http://localhost:8081/api/notes
Authorization: Bearer TENANT_2_TOKEN
Content-Type: application/json

{
    "title": "Note 1",
    "content": "First note"
}
```
✅ Repeat 2 more times - all should succeed (HTTP 201)

**Try creating 4th note:**
```
POST http://localhost:8081/api/notes
Authorization: Bearer TENANT_2_TOKEN
Content-Type: application/json

{
    "title": "Note 4",
    "content": "Should fail"
}
```
❌ Expected: HTTP 403 - "Note limit reached. FREE plan allows maximum 3 notes. Upgrade to PRO for unlimited notes."

---

## 6️⃣ TEST ROLE-BASED AUTHORIZATION

**As MEMBER user, try to delete a note:**
```
DELETE http://localhost:8081/api/notes/1
Authorization: Bearer TENANT_2_TOKEN_MEMBER
```
❌ Expected: HTTP 403 - {"error": "Forbidden"}

**As ADMIN user, delete note successfully:**
```
DELETE http://localhost:8081/api/notes/1
Authorization: Bearer TENANT_1_TOKEN_ADMIN
```
✅ Expected: HTTP 204 - Note deleted successfully

---

## 7️⃣ TEST TENANT UPGRADE (ADMIN ONLY)

**Note:** For this test, you need an ADMIN user on a FREE plan tenant. You can either:
- Create a new tenant with FREE plan and ADMIN user via database
- Or temporarily change Tenant 2 user role to ADMIN in database

**As MEMBER user, try to upgrade tenant (should fail):**
```
PUT http://localhost:8081/api/tenants/upgrade
Authorization: Bearer TENANT_2_TOKEN_MEMBER
```
❌ Expected: HTTP 403 - {"error": "Forbidden"}

**As ADMIN user on FREE plan, upgrade to PRO:**
```
PUT http://localhost:8081/api/tenants/upgrade
Authorization: Bearer ADMIN_FREE_TENANT_TOKEN
```
✅ Expected: HTTP 200 - "Tenant successfully upgraded to PRO plan"

**Try upgrading again (already PRO):**
```
PUT http://localhost:8081/api/tenants/upgrade
Authorization: Bearer ADMIN_PRO_TENANT_TOKEN
```
✅ Expected: HTTP 200 - "Tenant already on PRO plan"

---

## Test Data Available

**Tenant 1 User:**
- Email: admin@test.com
- Password: password123
- Tenant ID: 1
- Role: ADMIN

**Tenant 2 User:**
- Email: user@another.com
- Password: password123
- Tenant ID: 2
- Role: MEMBER

---

## Success Criteria ✅

**Authentication & Security:**
- [x] Login with correct password returns JWT token (200 OK)
- [x] Login with wrong password fails (401 Unauthorized)
- [x] Registration without tenantId/role succeeds (auto-assigned)
- [x] Requests with valid token work (200 OK)
- [x] Requests without token fail (401 Unauthorized)

**Tenant Isolation:**
- [x] Notes automatically get correct tenantId
- [x] Tenant 1 cannot see Tenant 2's notes (data isolation)

**Subscription Enforcement:**
- [x] FREE plan users can create up to 3 notes
- [x] 4th note creation fails with HTTP 403
- [x] PRO plan users have unlimited notes

**Role-Based Authorization:**
- [x] MEMBER users cannot delete notes (403 Forbidden)
- [x] ADMIN users can delete notes (204 No Content)

**Tenant Upgrade (ADMIN Only):**
- [x] MEMBER users cannot upgrade tenant (403 Forbidden)
- [x] ADMIN users can upgrade to PRO (200 OK)
- [x] Already PRO returns appropriate message (200 OK)

**If all pass → ALL REQUIREMENTS COMPLETE! 🎉**

