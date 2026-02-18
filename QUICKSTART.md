# Quick Start Guide

## 1. Local Development Setup

```bash
# Install dependencies
npm install

# Create .env.local file with your database credentials
# Copy from .env.local.example and update values
cp .env.local.example .env.local

# Edit .env.local with your database info
nano .env.local  # or use your editor

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 2. First Time Setup Checklist

- [ ] Clone repository locally
- [ ] Run `npm install`
- [ ] Create `.env.local` with database credentials
- [ ] Test locally with `npm run dev`
- [ ] Create first blog post via database or API
- [ ] Push to GitHub
- [ ] Create Vercel account
- [ ] Connect GitHub repository to Vercel
- [ ] Set environment variables in Vercel
- [ ] Add GitHub Actions secrets
- [ ] Test automatic deployment

## 3. Test Local Database Connection

```bash
# Make sure MySQL is running
# Then visit any page to test database initialization

# Or test via API:
curl http://localhost:3000/api/posts
```

## 4. Create Test Blog Post

Insert directly into database:

```sql
INSERT INTO posts (slug, title, content, excerpt) 
VALUES ('test-post', 'Test Post', 'This is a test!', 'Short excerpt');
```

Then visit: [http://localhost:3000/blog/test-post](http://localhost:3000/blog/test-post)

## 5. Access Admin Panel

Go to: [http://localhost:3000/admin](http://localhost:3000/admin)

Login with the `ADMIN_TOKEN` from your `.env.local`

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full setup instructions.

## Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

### Database connection error?
- Verify MySQL is running
- Check credentials in `.env.local`
- Ensure database `my_blog` exists

### Build errors?
```bash
npm run lint  # Check for lint issues
npm run build  # Try building
```

## Project Structure

```
my-blog/
├── pages/                    # Next.js pages & API routes
├── lib/                      # Utilities (db connection)
├── styles/                   # Global CSS
├── public/                   # Static files
├── .github/workflows/        # GitHub Actions CI/CD
├── scripts/                  # Utility scripts
├── package.json              # Dependencies
├── next.config.js            # Next.js config
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind CSS config
├── README.md                 # Project documentation
├── DEPLOYMENT.md             # Deployment guide
└── QUICKSTART.md             # This file
```

## Key Files to Know

- `lib/db.ts` - Database connection & initialization
- `pages/api/posts/index.ts` - Post CRUD API
- `pages/api/comments/[postId].ts` - Comments API
- `pages/api/admin/` - Admin endpoints
- `pages/index.tsx` - Blog listing page
- `pages/blog/[slug].tsx` - Individual post page
- `pages/admin.tsx` - Admin panel
- `.github/workflows/deploy.yml` - CI/CD pipeline

## Common Tasks

### Add a blog post
1. Insert into database, or
2. Use API with admin token, or
3. Add UI form later

### Approve comments
1. Go to `/admin`
2. Login with admin token
3. Click approve on pending comments

### Update blog
1. Make changes locally
2. `git commit` and `git push`
3. GitHub Actions automatically deploys

## Environment Variables

Required for both local and production:
- `DB_HOST` - MySQL hostname
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `ADMIN_TOKEN` - Admin authentication token

## Next Steps

1. ✅ Finish local setup
2. ✅ Test database connection
3. ✅ Create first blog post
4. ✅ Push to GitHub
5. ✅ Deploy to Vercel (see DEPLOYMENT.md)
6. ✅ Set up automatic deployment
7. 📝 Start writing blog posts!

---

Happy blogging! 🚀
