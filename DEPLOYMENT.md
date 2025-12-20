# 🚀 Render Deployment Guide

## Quick Deploy to Render

### Prerequisites
- GitHub account
- Render account (free tier works)
- This repository pushed to GitHub

---

## Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `notesapp-db`
   - **Database:** `notesapp_db`
   - **User:** `notesapp_user`
   - **Region:** Choose closest to you
   - **Plan:** Free
4. Click **"Create Database"**
5. Wait for provisioning (~2 minutes)
6. **Copy the Internal Database URL** (looks like: `jdbc:postgresql://dpg-xxx-internal:5432/notesapp_db`)

---

## Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `notesapp`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Build Command:** `mvn clean install`
   - **Start Command:** `java -jar target/*.jar`
   - **Plan:** Free

---

## Step 3: Set Environment Variables

In the Web Service settings, add these environment variables:

### Required Variables

```bash
# Database Configuration (from Step 1)
DB_URL=jdbc:postgresql://dpg-xxx-internal.oregon-postgres.render.com:5432/notesapp_db
DB_USERNAME=notesapp_user
DB_PASSWORD=<copy from Render PostgreSQL "Info" tab>

# JWT Configuration (generate a secure secret)
JWT_SECRET=<generate with: openssl rand -base64 32>
```

### Optional Variables

```bash
# For debugging (optional - defaults to false)
SHOW_SQL=false

# Token expiration (optional - defaults to 24 hours)
JWT_EXPIRATION=86400000
```

### Generate Secure JWT Secret

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Example output:** `gSJ4oTeHHUcr+NFvfyW4t0AArQ0/EODgjh+QLKLVKAw=`

---

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Run `mvn clean install`
   - Start with `java -jar target/*.jar`
   - Bind to the `PORT` environment variable (automatic)

3. **Wait for deployment** (~3-5 minutes for first deploy)

---

## Step 5: Verify Deployment

### Check Health
```bash
curl https://your-app-name.onrender.com/auth/login
```

Expected: `405 Method Not Allowed` or `400 Bad Request` (means app is running)

### Test Registration
```bash
curl -X POST https://your-app-name.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "tenantName": "Test Company"
  }'
```

Expected: JWT token string (200 OK)

### Test Login
```bash
curl -X POST https://your-app-name.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected: JWT token string (200 OK)

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Spin down:** Service sleeps after 15 minutes of inactivity
- **Cold start:** First request takes 30-60 seconds after sleep
- **Database:** 90-day expiration, limited storage

### Database Connection
- Always use **"Internal Database URL"** from Render (faster, free bandwidth)
- Format: `jdbc:postgresql://dpg-xxx-internal:5432/notesapp_db`
- Never use external URL for internal communication

### JWT Secret
- **Must be ≥32 characters** (application validates on startup)
- Generate a **unique** secret for production (don't use default)
- Store securely in Render environment variables

### Port Configuration
- **No action needed** - Render automatically provides `PORT` variable
- Application reads it automatically: `${PORT:8080}`

---

## Troubleshooting

### Build Failed
**Check logs for:**
- Maven build errors
- Java version mismatch (requires Java 17)

**Solution:**
- Ensure Java 17 is specified in Render build settings
- Check `pom.xml` has correct dependencies

### Database Connection Failed
**Check:**
- `DB_URL` format is correct
- Using **Internal** database URL (not external)
- Username and password match Render PostgreSQL

**Solution:**
- Copy credentials from Render PostgreSQL "Info" tab
- Use format: `jdbc:postgresql://host:5432/database`

### JWT Secret Error
**Error:** "JWT_SECRET must be at least 32 characters long"

**Solution:**
- Generate new secret: `openssl rand -base64 32`
- Set in Render environment variables
- Redeploy

### Application Won't Start
**Check Render logs for:**
- Environment variable errors
- Database connection issues
- Port binding problems

**Solution:**
- Verify all required env vars are set
- Check database is running
- Restart service

---

## 🎯 Deployment Checklist

- [ ] PostgreSQL database created on Render
- [ ] Internal database URL copied
- [ ] Web service created with GitHub integration
- [ ] Environment variables set:
  - [ ] `DB_URL` (internal URL)
  - [ ] `DB_USERNAME`
  - [ ] `DB_PASSWORD`
  - [ ] `JWT_SECRET` (≥32 characters)
- [ ] Build command: `mvn clean install`
- [ ] Start command: `java -jar target/*.jar`
- [ ] Deployment successful
- [ ] Registration endpoint tested
- [ ] Login endpoint tested

---

## 📊 Expected Behavior

### Successful Deployment
```
✅ Build: SUCCESS (2-3 minutes)
✅ Start: Application started on port 10000
✅ Database: Connected to PostgreSQL
✅ Health: Responding to requests
```

### Startup Logs Should Show
```
Starting NotesServiceApplication
Connected to database: notesapp_db
JWT secret validated (length: 44)
Tomcat started on port(s): 10000 (http)
Started NotesServiceApplication in X seconds
```

---

## 🚀 Next Steps After Deployment

1. **Test all endpoints** using Postman or curl
2. **Create test users** and verify authentication
3. **Check database** for created records
4. **Monitor logs** in Render dashboard
5. **Set up custom domain** (optional, paid feature)
6. **Configure health checks** (optional)

---

## 📝 Environment Variable Reference

| Variable | Required | Default | Production Value |
|----------|----------|---------|------------------|
| `DB_URL` | Yes | localhost | Internal Render URL |
| `DB_USERNAME` | Yes | postgres | From Render |
| `DB_PASSWORD` | Yes | postgres123 | From Render |
| `JWT_SECRET` | Production | 44-char default | Generate unique |
| `JWT_EXPIRATION` | No | 86400000 (24h) | Override if needed |
| `SHOW_SQL` | No | false | true for debugging |
| `PORT` | Auto | 8080 | Auto by Render |

---

## 🆘 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test database connection
4. Review application logs
5. Consult Render documentation

---

**Deployment Status:** ✅ Ready for Production (Free Tier)

