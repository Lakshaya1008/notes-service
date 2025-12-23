# API Documentation - Multi-Tenant Notes Service

## Base URL
```
http://localhost:8081
```

---

## 🔐 Security & Role Management

### Role Elevation Policy

**⚠️ IMPORTANT SECURITY DESIGN:**

- ✅ **Role elevation is intentionally NOT exposed via public API**
- ✅ **No REST endpoint exists to change user roles (MEMBER → ADMIN)**
- ✅ **All new registrations default to MEMBER role**
- ✅ **For testing purposes:** Role changes are performed directly in the database
- ✅ **In production:** Role management would be handled by internal admin tooling with proper audit trails

**Why No Public Role Management API?**
- Prevents privilege escalation attacks
- Separates tenant operations from administrative functions
- Production systems use dedicated admin panels with strict access controls
- Role changes require approval workflows and security audit logging

**For Testing ADMIN Features:**
```sql
-- Connect to database and run:
UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';
```

Then login again to receive a fresh JWT token with the updated ADMIN role.

---

## Authentication Endpoints

### 1. Register New User

**POST** `/auth/register`

Create a new user account and receive a JWT token immediately.

**Request (Default - Assigns to Tenant 2 FREE Plan):**
```json
POST /auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword123"
}
```

**Request (With Invite Code - Assigns to Tenant 1 PRO Plan):**
```json
POST /auth/register
Content-Type: application/json

{
    "email": "premiumuser@example.com",
    "password": "securepassword123",
    "inviteCode": "TENANT1_PRO_INVITE"
}
```

**Request Fields:**
- `email`: **Required**, must be valid email format
- `password`: **Required**, minimum 6 characters
- `inviteCode`: **Optional**, use `"TENANT1_PRO_INVITE"` to assign user to Tenant 1 (PRO plan)

**Response (Success):**
```json
HTTP 200 OK
Content-Type: text/plain

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInRlbmFudElkIjoxLCJyb2xlIjoiTUVNQkVSIi...
```

**Response (Email Already Exists):**
```json
HTTP 400 Bad Request
Content-Type: text/plain

Email already registered
```

**Response (Validation Error):**
```json
HTTP 400 Bad Request
Content-Type: application/json

{
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
}
```

**Tenant Assignment Logic:**
- ✅ **No inviteCode**: User assigned to **Tenant 2** (FREE plan, max 3 notes per user) - Default for public registration
- ✅ **inviteCode = "TENANT1_PRO_INVITE"**: User assigned to **Tenant 1** (PRO plan, unlimited notes) - Premium access
- ✅ **Invalid/unknown inviteCode**: Ignored, defaults to Tenant 2 (FREE)
- ✅ All new users are assigned **MEMBER role** by default

**Important Notes:**
- This invitation code system simulates production-grade tenant onboarding for assignment purposes
- In production, this would use cryptographically signed JWT invitation tokens with expiration
- You **cannot** specify `tenantId` or `role` directly in the request body

---

### 2. Login

**POST** `/auth/login`

Authenticate with email and password to receive a JWT token.

**Request:**
```json
POST /auth/login
Content-Type: application/json

{
    "email": "admin@test.com",
    "password": "password123"
}
```

**Validation Rules:**
- `email`: Required, must be valid email format
- `password`: Required

**Response (Success):**
```json
HTTP 200 OK
Content-Type: text/plain

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInRlbmFudElkIjoxLCJyb2xlIjoiQURNSU4iLCJpYXQi...
```

**Response (Invalid Credentials):**
```json
HTTP 401 Unauthorized
Content-Type: text/plain

Invalid credentials
```

**JWT Token Claims:**
The returned token contains:
- `userId`: User's database ID
- `tenantId`: User's tenant ID (for multi-tenancy)
- `role`: User's role (ADMIN or MEMBER)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (24 hours from issue)

**Security Notes:**
- Password validation is enforced
- Generic error message returned for security (doesn't reveal if email exists)
- Tokens expire after 24 hours (configurable in `application.yaml`)

---

## Notes Management Endpoints

**Authentication Required:** All endpoints require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 3. Create Note

**POST** `/api/notes`

Create a new note for the authenticated user's tenant.

**Request:**
```json
POST /api/notes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "title": "My Note Title",
    "content": "Note content goes here"
}
```

**Validation Rules:**
- `title`: Required, not blank
- `content`: Required, not blank

**Response (Success):**
```json
HTTP 201 Created
Content-Type: application/json

{
    "id": 1,
    "title": "My Note Title",
    "content": "Note content goes here",
    "tenantId": 1,
    "createdBy": 1,
    "createdAt": "2025-12-20T10:30:00",
    "updatedAt": "2025-12-20T10:30:00"
}
```

**Response (Subscription Limit Reached - FREE Plan):**
```json
HTTP 403 Forbidden
Content-Type: application/json

{
    "error": "Note limit reached. FREE plan allows maximum 3 notes. Upgrade to PRO for unlimited notes."
}
```

**Response (Unauthorized):**
```json
HTTP 401 Unauthorized
Content-Type: application/json

{
    "error": "Unauthorized"
}
```

**Automatic Fields:**
- `tenantId`: Automatically set from JWT token (tenant isolation)
- `createdBy`: Automatically set from JWT token (user ID)
- `createdAt`: Automatically set to current timestamp
- `updatedAt`: Automatically set to current timestamp

**Subscription Enforcement:**
- **FREE Plan:** Maximum 3 notes per tenant
- **PRO Plan:** Unlimited notes
- Limit check happens before note creation

---

### 4. Get All Notes

**GET** `/api/notes`

Retrieve all notes for the authenticated user's tenant.

**Request:**
```json
GET /api/notes
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (Success):**
```json
HTTP 200 OK
Content-Type: application/json

[
    {
        "id": 1,
        "title": "First Note",
        "content": "Content of first note",
        "tenantId": 1,
        "createdBy": 1,
        "createdAt": "2025-12-20T10:30:00",
        "updatedAt": "2025-12-20T10:30:00"
    },
    {
        "id": 2,
        "title": "Second Note",
        "content": "Content of second note",
        "tenantId": 1,
        "createdBy": 2,
        "createdAt": "2025-12-20T11:00:00",
        "updatedAt": "2025-12-20T11:00:00"
    }
]
```

**Response (Empty):**
```json
HTTP 200 OK
Content-Type: application/json

[]
```

**Tenant Isolation:**
- ✅ Only returns notes belonging to the user's tenant
- ✅ Notes from other tenants are never visible
- ✅ Query is automatically filtered by `tenantId` from JWT token

---

### 5. Get Note by ID

**GET** `/api/notes/{id}`

Retrieve a specific note by ID (with tenant validation).

**Request:**
```json
GET /api/notes/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (Success):**
```json
HTTP 200 OK
Content-Type: application/json

{
    "id": 1,
    "title": "My Note",
    "content": "Note content",
    "tenantId": 1,
    "createdBy": 1,
    "createdAt": "2025-12-20T10:30:00",
    "updatedAt": "2025-12-20T10:30:00"
}
```

**Response (Not Found / Wrong Tenant):**
```json
HTTP 404 Not Found
Content-Type: application/json

{
    "error": "Note not found with id: 1"
}
```

**Tenant Isolation:**
- ✅ Returns 404 if note doesn't exist
- ✅ Returns 404 if note belongs to different tenant
- ✅ Generic error message (doesn't reveal if note exists in other tenant)

---

### 6. Update Note

**PUT** `/api/notes/{id}`

Update an existing note (with tenant validation).

**Request:**
```json
PUT /api/notes/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "title": "Updated Title",
    "content": "Updated content"
}
```

**Validation Rules:**
- `title`: Required, not blank
- `content`: Required, not blank

**Response (Success):**
```json
HTTP 200 OK
Content-Type: application/json

{
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content",
    "tenantId": 1,
    "createdBy": 1,
    "createdAt": "2025-12-20T10:30:00",
    "updatedAt": "2025-12-20T12:00:00"
}
```

**Response (Not Found / Wrong Tenant):**
```json
HTTP 404 Not Found
Content-Type: application/json

{
    "error": "Note not found with id: 1"
}
```

**Automatic Fields:**
- `updatedAt`: Automatically updated to current timestamp
- `tenantId`, `createdBy`, `createdAt`: Remain unchanged

**Tenant Isolation:**
- ✅ Can only update notes belonging to user's tenant
- ✅ Returns 404 if note belongs to different tenant

---

### 7. Delete Note

**DELETE** `/api/notes/{id}`

Delete a note by ID.

**⚠️ Role Restriction: ADMIN only**

**Request:**
```json
DELETE /api/notes/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (Success - ADMIN user):**
```
HTTP 204 No Content
(No response body)
```

**Response (Forbidden - MEMBER user):**
```json
HTTP 403 Forbidden
Content-Type: application/json

{
    "error": "Forbidden"
}
```

**Response (Not Found / Wrong Tenant):**
```json
HTTP 404 Not Found
Content-Type: application/json

{
    "error": "Note not found with id: 1"
}
```

**Role-Based Authorization:**
- ✅ **ADMIN** users can delete notes
- ❌ **MEMBER** users receive HTTP 403
- This is the only endpoint with role restriction (demonstrates RBAC)

**Tenant Isolation:**
- ✅ Can only delete notes belonging to user's tenant
- ✅ Returns 404 if note belongs to different tenant

---

## Tenant Management Endpoints

**Authentication Required:** All endpoints require a valid JWT token with ADMIN role.

**⚠️ Role Restriction: ADMIN only**

---

### 8. Upgrade Tenant to PRO Plan

**PUT** `/api/tenants/upgrade`

Upgrade the authenticated user's tenant from FREE to PRO plan.

**⚠️ Role Restriction: ADMIN only**

**Request:**
```json
PUT /api/tenants/upgrade
Authorization: Bearer YOUR_JWT_TOKEN
```

**No Request Body Required**

**Response (Success - Upgraded to PRO):**
```
HTTP 200 OK
Content-Type: text/plain

Tenant successfully upgraded to PRO plan
```

**Response (Already PRO):**
```
HTTP 200 OK
Content-Type: text/plain

Tenant already on PRO plan
```

**Response (Forbidden - MEMBER user):**
```json
HTTP 403 Forbidden
Content-Type: application/json

{
    "error": "Forbidden"
}
```

**Response (Tenant Not Found):**
```json
HTTP 500 Internal Server Error
(Rare - indicates JWT contains invalid tenantId)
```

**Important Notes:**
- ✅ Tenant ID is automatically obtained from JWT token (TenantContext)
- ✅ You **cannot** specify which tenant to upgrade (security by design)
- ✅ Only ADMIN users can upgrade their own tenant
- ✅ Idempotent operation (safe to call multiple times)
- ✅ Once upgraded to PRO, tenant gets unlimited notes

**Use Case:**
```
1. Company starts on FREE plan (3 notes max)
2. Company grows, needs more notes
3. ADMIN user calls /api/tenants/upgrade
4. Tenant upgraded to PRO (unlimited notes)
5. All users in that tenant benefit immediately
```

**Security:**
- ✅ MEMBER users cannot upgrade (403)
- ✅ ADMIN can only upgrade their own tenant
- ✅ No cross-tenant upgrade possible

---

## Error Responses

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful |
| 201 Created | Resource created successfully |
| 204 No Content | Delete successful (no body) |
| 400 Bad Request | Invalid input / validation error |
| 401 Unauthorized | Missing or invalid JWT token |
| 403 Forbidden | Insufficient permissions / subscription limit |
| 404 Not Found | Resource not found / wrong tenant |
| 500 Internal Server Error | Unexpected server error |

### Error Response Format

**Validation Errors (400):**
```json
{
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
}
```

**General Errors (401, 403, 404):**
```json
{
    "error": "Error message here"
}
```

---

## Authentication & Authorization Summary

### Token Usage
1. Obtain token via `/auth/register` or `/auth/login`
2. Include token in all `/api/*` requests: `Authorization: Bearer YOUR_TOKEN`
3. Token expires after 24 hours
4. Token contains: userId, tenantId, role

### Role Permissions

| Endpoint | MEMBER | ADMIN |
|----------|--------|-------|
| POST /api/notes | ✅ | ✅ |
| GET /api/notes | ✅ | ✅ |
| GET /api/notes/{id} | ✅ | ✅ |
| PUT /api/notes/{id} | ✅ | ✅ |
| DELETE /api/notes/{id} | ❌ (403) | ✅ |
| PUT /api/tenants/upgrade | ❌ (403) | ✅ |

### Subscription Plan Limits

| Plan | Max Notes | DELETE Permission |
|------|-----------|-------------------|
| FREE | 3 notes | Based on role |
| PRO | Unlimited | Based on role |

---

## Multi-Tenancy

### How It Works
1. Each user belongs to exactly one tenant
2. `tenantId` is embedded in JWT token
3. All queries automatically filter by tenant
4. Cross-tenant access returns 404 (not 403)
5. Users cannot see or modify other tenants' data

### Example Scenario
```
User A (Tenant 1) creates Note ID=5
User B (Tenant 2) tries: GET /api/notes/5

Result: HTTP 404 Not Found
Reason: Note doesn't exist in Tenant 2's dataset
```

---

## Configuration

### JWT Settings
Located in `src/main/resources/application.yaml`:

```yaml
jwt:
  secret: ${JWT_SECRET:default-secret-key}
  expiration: 86400000  # 24 hours in milliseconds
```

**Environment Variable Override:**
```bash
export JWT_SECRET=your-custom-secret-key-here
```

---

## Testing Examples

See detailed testing guides:
- **Quick Start:** [POSTMAN-QUICK-START.md](POSTMAN-QUICK-START.md)
- **Comprehensive Testing:** [TESTING-GUIDE.md](TESTING-GUIDE.md)

---

## Security Features

✅ JWT-based authentication  
✅ Password validation on login  
✅ Secure registration (auto-assign tenant/role)  
✅ Tenant isolation at query level  
✅ Role-based authorization (@PreAuthorize)  
✅ Subscription limit enforcement  
✅ Input validation with Bean Validation  
✅ Generic error messages (no information leakage)  
✅ Externalized JWT configuration  

---

**Last Updated:** December 20, 2025

