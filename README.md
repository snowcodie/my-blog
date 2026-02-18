# my-blog

A modern personal blog built with Next.js, MySQL, and deployed to Vercel with GitHub Actions CI/CD.

## Features

- **Blog Posts**: Create and manage blog posts with full CRUD operations
- **Comments**: Readers can leave comments (require admin approval)
- **Likes**: Track likes on both posts and comments
- **Admin Panel**: Simple dashboard to manage comments and posts
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Auto-Deployment**: GitHub Actions pipeline for automatic Vercel deployment

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Hosting**: Vercel (free tier)
- **CI/CD**: GitHub Actions
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Setup

### 1. Environment Variables

Create a `.env.local` file in the project root:

```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=my_blog
ADMIN_TOKEN=your_secure_admin_token_here
NEXT_PUBLIC_ADMIN_TOKEN=your_secure_admin_token_here
```

### 2. Database Setup

The app automatically initializes the database tables on first run. Ensure your MySQL database is accessible.

Tables created:
- `posts`: Blog posts with title, content, slug, likes
- `comments`: Comments with approval status
- `admin_users`: Admin user credentials (for future enhancement)

### 3. Installation

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Building

```bash
npm run build
npm start
```

## API Endpoints

### Posts
- `GET /api/posts` - Get all published posts
- `GET /api/posts?slug=post-slug` - Get single post
- `POST /api/posts` - Create new post (requires admin token)
- `PUT /api/posts/[id]` - Update post likes (requires admin token)

### Comments
- `GET /api/comments/[postId]` - Get approved comments for a post
- `POST /api/comments/[postId]` - Submit new comment
- `PUT /api/comments/[commentId]/like` - Like a comment

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/posts` - Get all posts (requires admin token)
- `GET /api/admin/comments/pending` - Get pending comments (requires admin token)
- `PUT /api/admin/comments/[commentId]` - Approve/reject comment
- `DELETE /api/admin/comments/[commentId]` - Delete comment

## Admin Panel

Access at `/admin` and login with your `ADMIN_TOKEN`.

Features:
- View pending comments for moderation
- Approve or delete comments
- View all posts with statistics

## Deployment to Vercel

### Prerequisites
- Vercel account (free)
- GitHub repository
- MySQL database (PlanetScale, AWS RDS, or any hosting)

### Setup Steps

1. **Connect GitHub Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add:
     - `DB_HOST`
     - `DB_USER`
     - `DB_PASSWORD`
     - `DB_NAME`
     - `ADMIN_TOKEN`
     - `NEXT_PUBLIC_ADMIN_TOKEN`

3. **GitHub Actions Secrets** (for CI/CD pipeline)
   - Go to GitHub repository Settings → Secrets and variables → Actions
   - Add:
     - `VERCEL_TOKEN`: Get from [Vercel Settings](https://vercel.com/account/tokens)
     - `VERCEL_ORG_ID`: From Vercel dashboard URL
     - `VERCEL_PROJECT_ID`: From Vercel project settings
     - `DATABASE_URL`: (Optional, if needed by your deployment)

### Auto-Deployment

Once set up, every push to `main` or `master` branch will:
1. Install dependencies
2. Build the Next.js app
3. Run linting
4. Deploy to Vercel automatically

## Writing Blog Posts

### Via MySQL
```sql
INSERT INTO posts (slug, title, content, excerpt) VALUES 
('my-first-post', 'My First Post', 'Long content here...', 'Short excerpt');
```

### Via API
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your_admin_token" \
  -d '{
    "slug": "my-first-post",
    "title": "My First Post",
    "content": "Long content here...",
    "excerpt": "Short excerpt"
  }'
```

## Project Structure

```
my-blog/
├── pages/
│   ├── index.tsx           # Home page (blog listing)
│   ├── admin.tsx           # Admin panel
│   ├── api/
│   │   ├── posts/          # Post endpoints
│   │   ├── comments/       # Comment endpoints
│   │   └── admin/          # Admin endpoints
│   └── blog/
│       └── [slug].tsx      # Individual blog post
├── lib/
│   └── db.ts               # Database connection
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions pipeline
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Security Notes

- Always use strong `ADMIN_TOKEN` values
- Keep database credentials secure
- Comments require approval before displaying
- Use environment variables for sensitive data
- Never commit `.env.local` to GitHub

## Troubleshooting

### Database Connection Issues
- Verify MySQL host is accessible from Vercel
- Check credentials are correct
- Ensure database exists

### Deployment Fails
- Check GitHub Actions logs for errors
- Verify Vercel secrets are set
- Ensure Node.js version compatibility

### Comments Not Displaying
- Check admin panel for pending comments
- Approve comments before they appear publicly

## Future Enhancements

- [ ] Rich text editor for blog posts
- [ ] Search functionality
- [ ] Tags/Categories
- [ ] Social media sharing
- [ ] Reading time estimation
- [ ] Newsletter subscription
- [ ] Advanced admin features (edit posts, user management)
- [ ] Comment replies/threading
- [ ] Analytics dashboard

## License

MIT

## Support

For issues or questions, check the GitHub repository or documentation.
