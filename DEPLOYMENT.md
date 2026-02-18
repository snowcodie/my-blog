# Deployment Guide

This guide will help you deploy your personal blog to Vercel with automatic CI/CD via GitHub Actions.

## Prerequisites

- GitHub account with your blog repository
- Vercel account (free tier available)
- MySQL database (PlanetScale, AWS RDS, or similar)
- Node.js 18+ installed locally

## Step 1: Prepare Your GitHub Repository

```bash
# Initialize git in your project
git init
git add .
git commit -m "Initial commit: personal blog setup"

# Push to GitHub (replace with your repo URL)
git remote add origin https://github.com/your-username/my-blog.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up MySQL Database

### Option A: PlanetScale (Recommended for Vercel)
1. Create account at [PlanetScale](https://planetscale.com)
2. Create a new database
3. Get connection credentials:
   - Host
   - Username
   - Password
   - Database name

### Option B: AWS RDS
1. Create RDS MySQL instance
2. Get connection details from AWS console

### Option C: Local MySQL (for development)
```bash
mysql -u root -p
CREATE DATABASE my_blog;
```

## Step 3: Set Up Vercel Project

### 3.1 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Click "Import"

### 3.2 Configure Environment Variables in Vercel

In Vercel Project Settings → Environment Variables, add:

```
DB_HOST=your.mysql.host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=my_blog
ADMIN_TOKEN=generate_a_strong_random_token_here
NEXT_PUBLIC_ADMIN_TOKEN=same_token_as_above
```

**Tips for generating ADMIN_TOKEN:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use this online generator:
# https://www.lastpass.com/generate-password
```

## Step 4: Set Up GitHub Actions Secrets

For automatic deployment pipeline:

1. Go to GitHub repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secrets:

### 4.1 VERCEL_TOKEN
1. Go to [Vercel Settings](https://vercel.com/account/tokens)
2. Create new token (any name)
3. Copy and paste into GitHub secret

### 4.2 VERCEL_ORG_ID
1. Copy from Vercel dashboard URL: `vercel.com/your-org-id/...`
2. Add as GitHub secret

### 4.3 VERCEL_PROJECT_ID
1. Go to your Vercel project settings
2. Find "Project ID"
3. Copy and add to GitHub secret

## Step 5: Test the Pipeline

Make a test commit and push:

```bash
git add .
git commit -m "Test deployment pipeline"
git push
```

Monitor the deployment:
1. Go to GitHub Actions tab in your repository
2. Watch the "Deploy to Vercel" workflow
3. Check Vercel dashboard for deployment status

## Step 6: Initialize Database

The database tables are created automatically on first API call.

To manually initialize:

```bash
# Local development
npm run dev

# Visit a page to trigger API call
# Tables will be created automatically
```

## Step 7: Add Your First Blog Post

### Via Direct SQL
```sql
INSERT INTO posts (slug, title, content, excerpt) VALUES 
('hello-world', 
 'Hello World', 
 'This is my first blog post. Feel free to add more content here!',
 'My first blog post');
```

### Via API
```bash
curl -X POST https://your-vercel-domain.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your_admin_token" \
  -d '{
    "slug": "hello-world",
    "title": "Hello World",
    "content": "This is my first blog post!",
    "excerpt": "My first blog post"
  }'
```

## Step 8: Access Admin Panel

1. Go to `https://your-vercel-domain.vercel.app/admin`
2. Enter your `ADMIN_TOKEN`
3. Manage comments and view posts

## Automatic Deployment Flow

After setup, here's what happens automatically:

```
You make changes locally
         ↓
   Push to GitHub
         ↓
GitHub Actions triggers
         ↓
npm install & npm run build
         ↓
npm run lint (optional)
         ↓
Deploy to Vercel
         ↓
Site goes live automatically
```

## Deployment Troubleshooting

### Build Fails
**Check logs:** GitHub Actions tab → Deploy workflow
**Common issues:**
- Missing environment variables
- Database connection error
- Dependencies not installed

**Solution:**
```bash
# Verify locally first
npm install
npm run build
```

### Vercel Deployment Fails
1. Check Vercel project logs
2. Verify all environment variables are set
3. Ensure database is accessible from Vercel's IP

### Database Connection Issues
1. Verify credentials in Vercel
2. Check database server is running
3. For PlanetScale, ensure branch is connected
4. Test locally first with `.env.local`

### Admin Panel Won't Load
1. Verify `ADMIN_TOKEN` is correct
2. Check Vercel environment variables are deployed
3. Redeploy the project

## Making Changes to Your Blog

### Adding Blog Posts
1. Option A: Direct database (SQL)
2. Option B: API call with admin token
3. Option C: Add CMS integration later

### Deploying Changes
```bash
# Make your changes locally
git add .
git commit -m "Your message"
git push origin main

# GitHub Actions automatically deploys
# Check Vercel dashboard for live status
```

## Custom Domain Setup (Optional)

1. In Vercel project settings → Domains
2. Add your domain
3. Update DNS records (follow Vercel's instructions)
4. Wait for DNS propagation (usually 5-30 minutes)

## Monitoring & Maintenance

### View Deployment Logs
- **GitHub**: Repository → Actions tab
- **Vercel**: Project → Deployments tab

### Monitor Application
- Check Vercel Analytics dashboard
- View error logs in Vercel
- Monitor database usage

### Regular Maintenance
- Backup database regularly
- Update dependencies monthly
- Review pending comments periodically
- Monitor for spam/malicious comments

## Scaling & Performance

If your blog grows:

1. **Database**: Consider upgrading MySQL plan
2. **Images**: Use Vercel Image Optimization
3. **Caching**: Implement ISR (Incremental Static Regeneration)
4. **CDN**: Vercel provides edge network automatically

## Security Reminders

- Keep `ADMIN_TOKEN` secret
- Use strong database passwords
- Enable SSL/TLS (automatic with Vercel)
- Moderate comments before publishing
- Keep dependencies updated

## Rollback Previous Version

If something goes wrong:

```bash
# In GitHub
git revert <commit-hash>
git push origin main

# Or manually revert and push
git reset --hard <previous-commit>
git push -f origin main
```

## Next Steps

1. Customize the blog design
2. Add more blog posts
3. Monitor comments and moderate them
4. Consider adding:
   - Newsletter integration
   - Search functionality
   - Tags/Categories
   - Social sharing buttons

## Support

For issues:
1. Check GitHub Actions logs
2. Review Vercel deployment logs
3. Verify environment variables
4. Test locally with `npm run dev`
5. Check database connectivity

---

Your blog is now live and automatically deploying! 🎉
