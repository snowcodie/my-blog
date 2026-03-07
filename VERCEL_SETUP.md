# Vercel Deployment Setup Guide

## Critical: Database Connection Error Fix

If you see this error in Vercel logs:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**This means your database environment variables are NOT set in Vercel.**

## Step-by-Step Fix

### 1. Create a PostgreSQL Database

Choose one of these free options:

**Option A: Vercel Postgres (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Follow the setup wizard
6. Environment variables will be automatically added ✅

**Option B: Aiven (Free Tier)**
1. Go to https://aiven.io/
2. Sign up for free account
3. Create a PostgreSQL service (free tier available)
4. Note down the connection details

**Option C: Neon (Free Tier)**
1. Go to https://neon.tech/
2. Sign up and create a project
3. Get the connection string

### 2. Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add these variables:

```env
DB_HOST=your-database-host.com
DB_PORT=12345
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
NODE_ENV=production
```

### 3. Test the Connection

After setting environment variables:

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the **···** menu on latest deployment
   - Click **Redeploy**

2. **Visit the health check endpoint**:
   ```
   https://your-app.vercel.app/api/health
   ```

   You should see:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "config": {
       "hasHost": true,
       "hasPort": true,
       "hasUser": true,
       "hasPassword": true,
       "hasDatabase": true
     }
   }
   ```

### 4. Initialize Database Tables

Visit this endpoint once to create all tables:
```
https://your-app.vercel.app/api/init-db
```

## Verifying Your Setup

Check each endpoint:
- ✅ `/api/health` - Should return "healthy"
- ✅ `/api/settings` - Should return default settings
- ✅ `/api/posts` - Should return empty array `[]`
- ✅ `/api/nav-sections` - Should return empty array `[]`

## Common Issues

### Issue: "connect ECONNREFUSED 127.0.0.1:5432"
**Cause**: Environment variables not set in Vercel
**Fix**: Follow steps 2-3 above

### Issue: "password authentication failed"
**Cause**: Wrong DB_USER or DB_PASSWORD
**Fix**: Double-check credentials from your database provider

### Issue: "database does not exist"
**Cause**: Wrong DB_NAME or database not created
**Fix**: Create the database in your PostgreSQL service first

### Issue: SSL connection error
**Cause**: Database requires SSL but it's not enabled
**Fix**: This is handled automatically in production, but verify `NODE_ENV=production` is set

## Security Checklist

- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] Database password is strong and unique
- [ ] Environment variables are set in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)

## Need Help?

1. Check Vercel function logs for specific error messages
2. Use `/api/health` endpoint to diagnose connection issues
3. Verify all environment variables are set correctly
