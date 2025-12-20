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

#### Local Development
Edit `src/main/resources/application.yaml` or set environment variables:
```bash
# Optional for local development (defaults provided)
export JWT_SECRET=your_secret_key_here_minimum_32_characters_long
export DB_URL=jdbc:postgresql://localhost:5432/notesapp_db
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export PORT=8080
```

**Important:** 
- A **default JWT_SECRET is provided** for local development and assignment review convenience
- **Production deployments MUST override** `JWT_SECRET` via environment variable
- Never use the default secret in production environments

### 3. Run Application
```bash
mvn spring-boot:run
```

Server starts on **http://localhost:8080** (or the port specified by `PORT` env var)

### 4. Test with Postman

**Register New User:**
```bash
POST http://localhost:8080/auth/register
Content-Type: application/json

{
    "email": "newuser@example.com",
    "password": "mypassword"
}
```
> Note: New users are automatically assigned to tenant ID=1 with MEMBER role.

**Login:**
```bash
POST http://localhost:8080/auth/login
Content-Type: application/json

{
    "email": "admin@test.com",
    "password": "password123"
}
```

**Create Note (with token):**
```bash
POST http://localhost:8080/api/notes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "title": "My Note",
    "content": "Note content"
}
```

## Deployment (Render)

This application is ready for deployment on Render's free tier with minimal configuration.

### Prerequisites
- A Render account (https://render.com)
- A GitHub repository with this code
- A PostgreSQL database (can use Render's managed PostgreSQL)

### Required Environment Variables

Configure these in your Render Web Service settings:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://dpg-xxx.oregon-postgres.render.com:5432/notesapp_db` | ✅ Yes |
| `DB_USERNAME` | Database username | `notesapp_user` | ✅ Yes |
| `DB_PASSWORD` | Database password | `<provided by Render>` | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `gSJ4oTeHHUcr+NFvfyW4t0AArQ0/EODgjh+QLKLVKAw=` | ⚠️ **Production only** |
| `JWT_EXPIRATION` | Token expiration in milliseconds | `86400000` (24 hours) | ❌ No (defaults to 24h) |
| `SHOW_SQL` | Show SQL queries in logs | `false` | ❌ No (defaults to true) |

**Important Notes:**
- `JWT_SECRET` must be at least 32 characters for HMAC-SHA256
- **Local development:** A default JWT secret is provided in `application.yaml`
- **Production:** You MUST override `JWT_SECRET` with a secure random value
- Generate a secure random string: `openssl rand -base64 32`
- The `PORT` environment variable is automatically provided by Render
- For Render's internal PostgreSQL, use the "Internal Database URL" format

### Render Setup Steps

#### 1. Create PostgreSQL Database (if not using external DB)
1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Choose a name (e.g., `notesapp-db`)
3. Select the Free tier
4. Click "Create Database"
5. Wait for provisioning
6. Note down the **Internal Database URL** (starts with `jdbc:postgresql://`)

#### 2. Create Web Service
1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name:** `notesapp` (or your choice)
   - **Environment:** `Java`
   - **Build Command:** `mvn clean install`
   - **Start Command:** `java -jar target/*.jar`
   - **Instance Type:** Free

#### 3. Configure Environment Variables
In the Web Service settings, add the following environment variables:

```
DB_URL=<Your Render PostgreSQL Internal URL>
DB_USERNAME=<Database username from Render>
DB_PASSWORD=<Database password from Render>
JWT_SECRET=<Generate a secure 32+ character string>
SHOW_SQL=false
```

**Example for Render PostgreSQL:**
```
DB_URL=jdbc:postgresql://dpg-abcd1234.oregon-postgres.render.com:5432/notesapp_db
DB_USERNAME=notesapp_user
DB_PASSWORD=xYz789...
JWT_SECRET=gSJ4oTeHHUcr+NFvfyW4t0AArQ0/EODgjh+QLKLVKAw=
```

#### 4. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Run `mvn clean install`
   - Start the application with `java -jar target/*.jar`
   - Bind to the PORT provided by Render
3. Wait for deployment to complete
4. Your app will be available at `https://your-app-name.onrender.com`

### Port Binding
The application automatically reads the `PORT` environment variable provided by Render. No manual configuration needed.

**How it works:**
```yaml
server:
  port: ${PORT:8080}
```
- On Render: Uses the PORT provided by the platform
- Locally: Defaults to 8080 if PORT is not set

### Database Initialization
The application uses `spring.jpa.hibernate.ddl-auto=update` to automatically create/update database tables on startup.

**⚠️ IMPORTANT - Database Schema Management:**
- `ddl-auto=update` is **ONLY for development/testing and assignment review**
- **DO NOT use in production** - it can cause data loss or schema corruption
- **Production systems** should use proper migration tools like **Flyway** or **Liquibase**
- For this assignment, `update` is intentionally used to simplify reviewer setup

**For production data:**
1. Connect to your Render PostgreSQL using a SQL client
2. Run your schema SQL files (`database-schema.sql`)
3. Run your test/seed data SQL files (`test-data.sql`)

**Connection Details:**
- Available in Render Dashboard → PostgreSQL instance → "Info" tab
- Use the "External Database URL" for client connections

### Verifying Deployment

#### Health Check
```bash
curl https://your-app-name.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

#### Expected Behaviors
- ✅ App starts without errors (uses default JWT_SECRET if not set)
- ✅ Responds to HTTP requests
- ✅ Connects to PostgreSQL successfully
- ✅ JWT authentication works
- ⚠️ **Production:** Must set `JWT_SECRET` environment variable to override default
- ❌ App fails to start if database credentials are invalid

### Troubleshooting

**App won't start:**
- Check Render logs for missing environment variables
- Verify database credentials are correct
- For production: Ensure `JWT_SECRET` is set to a secure value (not the default)

**Database connection errors:**
- Ensure you're using the **Internal Database URL** from Render
- Format must be: `jdbc:postgresql://hostname:5432/database_name`
- Verify database username and password match Render's values

**Port binding issues:**
- No action needed - Render automatically provides the PORT variable
- The application is configured to read it automatically

### Cost Considerations (Free Tier)
- **Web Service:** Free tier includes 750 hours/month
- **PostgreSQL:** Free tier includes 90-day expiration and limited storage
- **Limitations:** Free services spin down after 15 minutes of inactivity
- **Cold starts:** First request after inactivity may take 30-60 seconds

### Production Recommendations (Beyond Free Tier)
When moving beyond the free tier:
- Use a paid PostgreSQL instance for data persistence
- Enable health check endpoints
- Consider adding Flyway/Liquibase for database migrations
- Use BCrypt for password hashing
- Implement rate limiting
- Add monitoring and alerting
- Use a secrets manager for sensitive values

## 🔒 Security Features

### JWT Authentication
- All `/api/*` endpoints require valid JWT token
- JWT secret configuration:
  - Default value provided in `application.yaml` for local development/assignment review
  - Production deployments MUST override via `JWT_SECRET` environment variable
- Tokens expire after 24 hours (configurable via `JWT_EXPIRATION`)
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

### Testing ADMIN Role Functionality

**Background:**
- Role management APIs are **intentionally NOT exposed** for security
- User roles are managed at the database level
- For testing ADMIN-only features (like DELETE), roles must be updated directly in the database

**How to Test ADMIN Authorization:**

1. **Register a new user** (they will have MEMBER role by default):
   ```bash
   POST /auth/register
   {
     "email": "testadmin@example.com",
     "password": "password123",
     "tenantName": "Test Company"
   }
   ```

2. **Connect to your PostgreSQL database** and run:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'testadmin@example.com';
   ```

3. **Login with the user** to get a fresh JWT token with ADMIN role:
   ```bash
   POST /auth/login
   {
     "email": "testadmin@example.com",
     "password": "password123"
   }
   ```

4. **Test ADMIN-only endpoint** (DELETE note):
   ```bash
   DELETE /api/notes/{id}
   Authorization: Bearer <token>
   ```

**Result:**
- ✅ ADMIN users: Successfully delete notes (200 OK)
- ❌ MEMBER users: Receive 403 Forbidden

**Note:** In a production system, role management would be handled via dedicated admin APIs with proper authorization checks.

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
- **Current:** Default secret in `application.yaml` for local development/assignment review
- **Production:** 
  - MUST override via `JWT_SECRET` environment variable (no default in production configs)
  - Rotated periodically
  - Stored in secrets manager (AWS Secrets Manager, HashiCorp Vault)
- **Reason:** Balances security with reviewer convenience - default enables easy local testing, but production override is mandatory

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

- **Port:** 8080 by default (configurable via `PORT` environment variable)
- **JWT Secret:** 
  - **Local/Review:** Default secret provided in `application.yaml` for convenience
  - **Production:** MUST override via `JWT_SECRET` environment variable with secure random value
- **Token Expiration:** 24 hours (configurable via `JWT_EXPIRATION` env var)
- **Password Security:** ⚠️ Plain text (for assignment purposes only - use BCrypt in production)
- **Database Schema:** ⚠️ Uses `ddl-auto=update` for dev/testing only - use Flyway/Liquibase in production
- **Default Tenant:** New registrations go to tenant ID=1
- **Subscription Limits:** FREE plan limited to 3 notes
- **Database Config:** All credentials configurable via environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`)
- **Deployment Ready:** Application reads all config from environment variables for Render/cloud deployment

## License

Educational project - No license
