# Notes Service - Multi-Tenant SaaS Application

A secure, multi-tenant Spring Boot REST API for managing notes with JWT authentication and complete tenant isolation.

## Features
- ✅ Multi-tenant architecture with complete data isolation
- ✅ JWT-based authentication with password validation
- ✅ User registration and login
- ✅ Full CRUD operations for notes
- ✅ Subscription plan enforcement (FREE plan: max 3 notes)
- ✅ Role-based authorization (ADMIN/MEMBER)
- ✅ Automatic tenant context management
- ✅ Input validation with Jakarta Bean Validation
- ✅ Global exception handling
- ✅ PostgreSQL persistence

## Tech Stack
- Java 17+
- Spring Boot 3.5.9
- Spring Data JPA
- Spring Security 6.5.7
- JWT (JJWT 0.11.5)
- PostgreSQL
- Maven

## API Endpoints

### Authentication (Public - No Token Required)

| Method | Endpoint            | Description                    | Auth Required |
|--------|---------------------|--------------------------------|---------------|
| POST   | /auth/register      | Register new user & get token  | ❌ No         |
| POST   | /auth/login         | Login & get JWT token          | ❌ No         |

### Notes Management (Protected - Token Required)

| Method | Endpoint            | Description                    | Auth Required | Tenant Isolated | Role Required |
|--------|---------------------|--------------------------------|---------------|-----------------|---------------|
| POST   | /api/notes          | Create a note                  | ✅ Yes        | ✅ Yes          | MEMBER/ADMIN  |
| GET    | /api/notes          | Get all notes (tenant filtered)| ✅ Yes        | ✅ Yes          | MEMBER/ADMIN  |
| GET    | /api/notes/{id}     | Get note by ID (tenant check)  | ✅ Yes        | ✅ Yes          | MEMBER/ADMIN  |
| PUT    | /api/notes/{id}     | Update note (tenant check)     | ✅ Yes        | ✅ Yes          | MEMBER/ADMIN  |
| DELETE | /api/notes/{id}     | Delete note (tenant check)     | ✅ Yes        | ✅ Yes          | **ADMIN only** |

### Tenant Management (Protected - Token Required, ADMIN only)

| Method | Endpoint            | Description                    | Auth Required | Role Required |
|--------|---------------------|--------------------------------|---------------|---------------|
| PUT    | /api/tenants/upgrade| Upgrade tenant to PRO plan     | ✅ Yes        | **ADMIN only** |

## Quick Start

### 1. Setup Database
```sql
-- Create database
CREATE DATABASE notesapp_db;

-- Run schema (database-schema.sql)
-- Run test data (test-data.sql)
```

### 2. Configure Application
Edit `src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/notesapp_db
    username: postgres
    password: your_password

jwt:
  secret: ${JWT_SECRET:gSJ4oTeHHUcr+NFvfyW4t0AArQ0/EODgjh+QLKLVKAw=}
  expiration: 86400000  # 24 hours
```

**Important:** In production, set `JWT_SECRET` environment variable instead of using the default.

### 3. Run Application
```bash
mvn spring-boot:run
```

Server starts on **http://localhost:8081**

### 4. Test with Postman

**Register New User:**
```bash
POST http://localhost:8081/auth/register
Content-Type: application/json

{
    "email": "newuser@example.com",
    "password": "mypassword"
}
```
> Note: New users are automatically assigned to tenant ID=1 with MEMBER role.

**Login:**
```bash
POST http://localhost:8081/auth/login
Content-Type: application/json

{
    "email": "admin@test.com",
    "password": "password123"
}
```

**Create Note (with token):**
```bash
POST http://localhost:8081/api/notes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "title": "My Note",
    "content": "Note content"
}
```

## 🔒 Security Features

### JWT Authentication
- All `/api/*` endpoints require valid JWT token
- JWT secret externalized to `application.yaml` (can be overridden with `JWT_SECRET` env var)
- Tokens expire after 24 hours
- Token contains: userId, tenantId, role
- Password validation enforced on login

### Tenant Isolation
- Every note belongs to exactly one tenant
- Users can ONLY access their tenant's data
- Cross-tenant access returns 404 (not 403)
- Enforced at database query level

### Role-Based Authorization
- **MEMBER**: Can create, read, and update notes within their tenant
- **ADMIN**: Has all MEMBER permissions + can delete notes

### Example:
```
Tenant 1 creates Note ID=5
Tenant 2 tries: GET /api/notes/5
Result: 404 Not Found ✅ (Blocked!)

MEMBER tries: DELETE /api/notes/5
Result: 403 Forbidden ✅ (Blocked!)
```

## 💳 Subscription Plan Enforcement

### FREE Plan (3 notes maximum)
- Users on FREE plan can create up to **3 notes**
- Attempting to create a 4th note returns HTTP 403 with message:
  ```json
  {
    "error": "Note limit reached. FREE plan allows maximum 3 notes. Upgrade to PRO for unlimited notes."
  }
  ```

### PRO Plan (unlimited notes)
- No note limits

### How to Test:
1. Find a tenant with FREE plan in database (Tenant 1 is FREE in test data)
2. Create 3 notes successfully
3. Try creating a 4th → Should receive 403 error

## Test Data

Default test users (after running test-data.sql):

**Tenant 1 - Test Company (FREE Plan):**
- Email: admin@test.com
- Password: password123
- Role: ADMIN

**Tenant 2 - Another Company (PRO Plan):**
- Email: user@another.com
- Password: password123
- Role: MEMBER

## Architecture

### Multi-Tenant Design
```
Request → JWT Filter → Extract tenantId → Set TenantContext
       → Service Layer → Query with tenant filter
       → Database → Returns only tenant's data
```

### Security Flow
```
1. User logs in → Password validated → Get JWT token
2. Token contains: {userId, tenantId, role}
3. Every request → Token validated
4. TenantContext set from token
5. All queries filtered by tenantId
6. Cross-tenant access impossible
7. Role-based authorization enforced
```

## 🎯 Trade-offs & Simplifications

This implementation makes intentional simplifications for assignment purposes. Here's what's simplified and what would be different in production:

### ✅ What's Implemented (Production-Ready)
- Multi-tenant data isolation at query level
- JWT-based authentication with proper token validation
- ThreadLocal tenant context with request-scoped lifecycle
- Subscription plan enforcement
- Role-based authorization
- Input validation with proper error responses
- Global exception handling

### ⚠️ Assignment Simplifications (Production Would Differ)

#### 1. Password Security
- **Current:** Plain text password storage and comparison
- **Production:** Use `BCryptPasswordEncoder` for hashing and validation
- **Reason:** Demonstrates authentication flow without cryptography complexity

#### 2. User Registration
- **Current:** All new users assigned to default tenant (ID=1) with MEMBER role
- **Production:** Invitation-based onboarding where:
  - Users receive invitation link with token
  - Token determines tenantId and initial role
  - Prevents unauthorized tenant access
- **Reason:** Simplifies testing and assignment scope

#### 3. JWT Secret Management
- **Current:** Secret in `application.yaml` with default fallback
- **Production:** 
  - Mandatory environment variable (no default)
  - Rotated periodically
  - Stored in secrets manager (AWS Secrets Manager, HashiCorp Vault)
- **Reason:** Acceptable for local development and assignment review

#### 4. Database Schema Management
- **Current:** `ddl-auto: update` for auto-schema updates
- **Production:** Use Flyway or Liquibase for versioned migrations
- **Reason:** Simplifies setup for reviewers

#### 5. Role Authorization Scope
- **Current:** One example endpoint (DELETE) requires ADMIN role
- **Production:** 
  - Fine-grained permissions per operation
  - Resource-level ownership checks
  - Audit logging for sensitive operations
- **Reason:** Demonstrates RBAC without over-engineering

#### 6. Error Messages
- **Current:** Generic "Invalid credentials" and "Unauthorized" messages
- **Production:** Same approach (don't leak information to attackers)
- **Status:** ✅ This IS production-ready

### 🚀 Production Enhancements Not Included
These would be added for real-world deployment but are beyond assignment scope:
- Rate limiting (prevent brute force attacks)
- Token refresh mechanism
- Password reset flow
- Email verification
- Comprehensive test coverage
- Pagination for note lists
- Search and filtering
- Soft delete for audit trail
- CORS configuration for specific origins
- Health check endpoints
- Metrics and monitoring
- Docker containerization

## Status

✅ **COMPLETE** - Multi-Tenant SaaS with Authentication, Authorization, and Subscription Enforcement
- ✅ JWT authentication with password validation
- ✅ Tenant context properly scoped
- ✅ All CRUD operations tenant-isolated
- ✅ Cross-tenant access blocked
- ✅ Subscription limits enforced (FREE: 3 notes, PRO: unlimited)
- ✅ Role-based authorization (ADMIN can delete, MEMBER cannot)
- ✅ Input validation on all DTOs
- ✅ JWT configuration externalized

## Development Notes

- **Port:** 8081 (configurable in application.yaml)
- **JWT Secret:** Externalized to application.yaml (override with `JWT_SECRET` env var)
- **Token Expiration:** 24 hours (configurable in application.yaml)
- **Password Security:** ⚠️ Plain text 
- **Default Tenant:** New registrations go to tenant ID=1
- **Subscription Limits:** FREE plan limited to 3 notes

## License

Educational project - No license
