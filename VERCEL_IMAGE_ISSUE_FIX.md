# Vercel Image Issue Fix

## Problem
Images (site logo, hero background) stored as base64 in database don't show on Vercel but work locally.

## Root Causes

1. **Request Body Size Limit**: Vercel serverless functions have a 4.5MB limit for request bodies
2. **Function Timeout**: Large image uploads might exceed the 10-second timeout on Hobby plan
3. **Database Packet Size**: PostgreSQL might have max_allowed_packet restrictions

## Solutions

### Option 1: Use Vercel Blob Storage (Recommended)

Instead of storing images as base64 in the database, use Vercel Blob Storage:

```bash
npm install @vercel/blob
```

Benefits:
- No size limits (up to 500MB per file on Pro plan)
- CDN-backed delivery (faster)
- No database bloat
- Direct image URLs

### Option 2: Optimize Images Before Upload

Before uploading to the database:
1. Compress images using tools like TinyPNG or ImageOptim
2. Keep images under 500KB
3. Use WebP format for better compression
4. Resize to appropriate dimensions (logo: 200x200px, hero: 1920x1080px)

### Option 3: Use External Image Hosting

Store images on:
- Cloudinary (free tier: 25GB storage)
- ImgBB (free unlimited)
- GitHub repository (for static images)
- AWS S3 / Azure Blob

Then store only the URL in the database.

## Current Configuration

I've added these fixes to your project:

1. **Route Configuration** in `app/api/settings/route.ts`:
   ```typescript
   export const dynamic = 'force-dynamic';
   export const runtime = 'nodejs';
   ```

2. **Vercel Function Timeout** in `vercel.json`:
   ```json
   "functions": {
     "app/api/settings/route.ts": {
       "maxDuration": 30
     }
   }
   ```

## Immediate Actions

1. **Check your current image sizes**:
   - Go to Admin → Settings
   - Check the file sizes before uploading
   - Try uploading images smaller than 500KB

2. **Clear Vercel Cache**:
   - Go to Vercel Dashboard → Deployments
   - Click on your latest deployment
   - Click "Redeploy" → Check "Clear cache and deploy"

3. **Check Vercel Logs**:
   - Vercel Dashboard → Your Project → Logs
   - Look for error messages about body size or timeouts

4. **Test with small image first**:
   - Upload a very small image (< 50KB)
   - If it works, the issue is size-related

## Environment Variables Check

Make sure these are set in Vercel:
- `DB_HOST` - Your PostgreSQL host
- `DB_PORT` - Usually 5432
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to 'production'

## Debug Steps

1. Open browser DevTools → Network tab
2. Try saving settings with a small image
3. Check the request payload size
4. Check the response

If you see:
- **413 Payload Too Large**: Images are too big
- **504 Gateway Timeout**: Function is timing out
- **405 Method Not Allowed**: Routing issue (should be fixed now)
- **500 Internal Server Error**: Check Vercel logs
