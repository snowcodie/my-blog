# GitHub Copilot Instructions - My Blog

This workspace contains a complete Next.js personal blog application with MySQL database, comment system, admin panel, and automatic Vercel deployment via GitHub Actions.

## Project Overview

**Type**: Next.js Full-Stack Blog Application
**Hosting**: Vercel (free tier)
**Database**: MySQL
**CI/CD**: GitHub Actions
**Authentication**: Token-based admin authentication

## Technology Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL (via mysql2 package)
- **Styling**: Tailwind CSS + Lucide Icons
- **Utilities**: date-fns, axios
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

## Project Structure

```
pages/
  ├── index.tsx                    # Blog listing homepage
  ├── admin.tsx                    # Admin dashboard
  ├── blog/[slug].tsx             # Individual blog post
  ├── api/
  │   ├── posts/                  # POST/GET posts API
  │   ├── comments/               # Comments API
  │   └── admin/                  # Admin endpoints
  ├── _app.tsx                    # Next.js app wrapper
  └── _document.tsx               # HTML document

lib/
  └── db.ts                       # MySQL connection & schema

styles/
  └── globals.css                 # Global Tailwind styles

.github/workflows/
  └── deploy.yml                  # GitHub Actions CI/CD pipeline

Configuration Files:
  ├── next.config.js
  ├── tsconfig.json
  ├── tailwind.config.js
  ├── postcss.config.js
  ├── vercel.json
  └── .env.local.example
```

## Key Features

1. **Blog Posts**: Create, read, publish blog posts with slug-based URLs
2. **Comments**: Readers can leave comments (require admin approval)
3. **Likes**: Track likes on posts and comments
4. **Admin Panel**: Simple dashboard at `/admin` for managing content
5. **Authentication**: Token-based admin access
6. **Auto-Deployment**: GitHub Actions automatically deploys to Vercel on push

## Environment Variables

Required environment variables (set in `.env.local` for development):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_blog
ADMIN_TOKEN=your_secure_token_here
NEXT_PUBLIC_ADMIN_TOKEN=your_secure_token_here
```

In Vercel dashboard, also set:
- All of the above variables
- Plus any deployment-specific variables

GitHub Actions Secrets needed:
- `VERCEL_TOKEN`: From Vercel Settings
- `VERCEL_ORG_ID`: Your Vercel org ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## Database Schema

**posts table**
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- slug (VARCHAR 255, UNIQUE)
- title (VARCHAR 255)
- content (LONGTEXT)
- excerpt (VARCHAR 500)
- likes (INT, default 0)
- published (BOOLEAN, default true)
- created_at, updated_at (TIMESTAMP)

**comments table**
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- post_id (INT, FOREIGN KEY)
- author (VARCHAR 100)
- email (VARCHAR 100)
- content (TEXT)
- likes (INT, default 0)
- approved (BOOLEAN, default false)
- created_at (TIMESTAMP)

**admin_users table**
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR 100, UNIQUE)
- password_hash (VARCHAR 255)
- created_at (TIMESTAMP)

## API Endpoints

### Public Endpoints
- `GET /api/posts` - List all published posts
- `GET /api/posts?slug=post-slug` - Get single post by slug
- `GET /api/comments/[postId]` - Get approved comments
- `POST /api/comments/[postId]` - Submit new comment
- `PUT /api/comments/[commentId]/like` - Like a comment

### Admin Endpoints (require x-admin-token header)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/posts` - Get all posts (admin)
- `GET /api/admin/comments/pending` - Get pending comments
- `PUT /api/admin/comments/[commentId]` - Approve/reject comment
- `DELETE /api/admin/comments/[commentId]` - Delete comment
- `POST /api/posts` - Create post (admin)
- `PUT /api/posts/[id]` - Update post likes (admin)

## Common Development Tasks

### Start Development Server
```bash
npm install  # First time only
npm run dev  # Starts at http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

### Create Blog Post
```sql
INSERT INTO posts (slug, title, content, excerpt, published) 
VALUES ('post-slug', 'Post Title', 'Content...', 'Excerpt...', true);
```

### Access Admin Panel
1. Navigate to `/admin`
2. Enter your `ADMIN_TOKEN` from `.env.local`
3. Manage comments and posts

## Deployment Flow

1. **Local Development**: Make changes, test with `npm run dev`
2. **Git Commit**: `git commit -m "message"`
3. **Push to GitHub**: `git push origin main`
4. **GitHub Actions**: Automatically:
   - Installs dependencies
   - Builds project
   - Runs linting
   - Deploys to Vercel
5. **Live**: Your blog is updated automatically

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Documentation Files

- **README.md** - Complete feature and API documentation
- **DEPLOYMENT.md** - Full Vercel deployment guide (read first!)
- **QUICKSTART.md** - Fast local setup guide
- **SETUP_SUMMARY.md** - Visual overview of the project

## Important Notes

1. **Database Initialization**: Tables are created automatically on first API call
2. **Comment Moderation**: New comments require admin approval before displaying
3. **Static Generation**: Blog pages use ISR for performance
4. **Environment Variables**: Keep `.env.local` secret, never commit to Git
5. **Admin Token**: Use strong, random tokens (32+ characters)

## Deployment Checklist

Before deploying to Vercel:
- [ ] Set up MySQL database
- [ ] Create GitHub repository
- [ ] Test locally with `npm run dev`
- [ ] Push to GitHub
- [ ] Create Vercel project
- [ ] Set environment variables in Vercel
- [ ] Add GitHub Actions secrets
- [ ] Test automatic deployment with test commit
- [ ] Access `/admin` and verify it works
- [ ] Create first blog post
- [ ] Set up custom domain (optional)

## Troubleshooting Tips

- **Database Connection**: Verify MySQL is running and credentials are correct
- **Build Fails**: Check GitHub Actions logs and try `npm run build` locally
- **Admin Won't Load**: Verify `ADMIN_TOKEN` and check Vercel logs
- **Comments Not Showing**: Check admin panel for pending comments - they need approval
- **Port 3000 Taken**: Use `npm run dev -- -p 3001` to use different port

## File Modification Guidelines

When editing files:
- Use TypeScript for `.ts` and `.tsx` files
- Follow existing code patterns and style
- Keep API routes RESTful
- Use Tailwind CSS for styling (no custom CSS unless necessary)
- Test changes locally before committing
- Update documentation if adding new features

## Future Enhancement Ideas

- Add rich text editor for blog posts
- Implement post search functionality
- Add tags/categories system
- Create RSS feed
- Add social media sharing
- Implement email notifications for comments
- Add reading time estimation
- Create blog post drafts system

## Support Resources

- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- MySQL docs: https://dev.mysql.com/doc/
