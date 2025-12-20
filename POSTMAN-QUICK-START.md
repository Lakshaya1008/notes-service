# Quick Postman Testing - Copy & Paste Ready

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
$env:PGPASSWORD='postgres123'; psql -U postgres -d notesapp_db -f test-data.sql
```

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

- [x] Login returns JWT token
- [x] Requests with valid token work (200 OK)
- [x] Requests without token fail (401 Unauthorized)
- [x] Notes automatically get correct tenantId
- [x] Tenant 1 cannot see Tenant 2's notes

**If all pass → STEP 2 COMPLETE! 🎉**

