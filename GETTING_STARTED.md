# Getting Started with My Blog

Welcome to your personal Next.js blog! This guide will help you get up and running in minutes.

## ⚡ Quick Start (10 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Database
```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit with your MySQL credentials
nano .env.local  # or use your editor of choice
```

Example `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_blog
ADMIN_TOKEN=generate_a_strong_random_token_here
NEXT_PUBLIC_ADMIN_TOKEN=same_token_here
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 📝 Create Your First Blog Post

### Option 1: Using SQL (Quickest)

```sql
-- Connect to your MySQL database
mysql -u root -p my_blog

-- Insert a blog post
INSERT INTO posts (slug, title, content, excerpt) VALUES (
  'hello-world',
  'Hello World!',
  'This is my first blog post on this awesome new blog!',
  'My first blog post'
);
```

Then visit: [http://localhost:3000/blog/hello-world](http://localhost:3000/blog/hello-world)

### Option 2: Using the API

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your_admin_token" \
  -d '{
    "slug": "hello-world",
    "title": "Hello World!",
    "content": "This is my first blog post!",
    "excerpt": "My first blog post"
  }'
```

## 🔐 Access Admin Panel

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Enter the `ADMIN_TOKEN` from your `.env.local`
3. You can now:
   - View all blog posts
   - View and moderate pending comments
   - Approve or delete comments
   - See statistics

## 🗄️ Database Setup

### If You Already Have MySQL

Just ensure:
- MySQL is running
- Database name is set correctly in `.env.local`
- User credentials are correct

Tables are created automatically on first API call!

### If You Need to Install MySQL

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql -u root
# CREATE DATABASE my_blog;
# EXIT;
```

**Windows:**
- Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Or use [MySQL Community Edition Installer](https://dev.mysql.com/downloads/windows/installer/)

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
mysql -u root -p
# CREATE DATABASE my_blog;
# EXIT;
```

**Alternative: Use PlanetScale (Cloud MySQL)**
- Go to [planetscale.com](https://planetscale.com)
- Create free account
- Create database
- Get connection credentials
- Use in `.env.local`

## 🌐 Deploy to Vercel (15 minutes)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide.

Quick summary:
1. Push code to GitHub
2. Create Vercel project
3. Set environment variables
4. Add GitHub Actions secrets
5. Done! Auto-deployment on every push

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Complete feature documentation |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Full Vercel deployment guide |
| [QUICKSTART.md](./QUICKSTART.md) | Local development quick start |
| [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) | Project overview |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | Copilot instructions |

## 📂 Project Structure Overview

```
my-blog/
├── pages/                    # Next.js pages and API routes
│   ├── index.tsx            # Homepage (blog listing)
│   ├── admin.tsx            # Admin dashboard
│   ├── blog/[slug].tsx      # Blog post page
│   ├── api/
│   │   ├── posts/           # Blog post API endpoints
│   │   ├── comments/        # Comment API endpoints
│   │   └── admin/           # Admin API endpoints
│   ├── _app.tsx             # App wrapper
│   └── _document.tsx        # HTML template
│
├── lib/
│   └── db.ts                # Database connection
│
├── styles/
│   └── globals.css          # Global styles
│
├── .github/
│   └── workflows/           # GitHub Actions pipelines
│       ├── deploy.yml       # Deploy to Vercel on push
│       └── test.yml         # Test on PR
│
├── db/
│   └── schema.sql           # Database schema (optional)
│
├── scripts/
│   └── init-db.sh           # Database initialization
│
├── Configuration files
│   ├── package.json         # Dependencies
│   ├── next.config.js       # Next.js config
│   ├── tsconfig.json        # TypeScript config
│   ├── tailwind.config.js   # Tailwind CSS config
│   ├── postcss.config.js    # PostCSS config
│   ├── .eslintrc.json       # ESLint config
│   ├── vercel.json          # Vercel config
│   └── .env.local.example   # Environment template
│
└── Documentation files
    ├── README.md            # Features and API docs
    ├── DEPLOYMENT.md        # Deployment guide
    ├── QUICKSTART.md        # Quick setup
    └── SETUP_SUMMARY.md     # Project overview
```

## 🔑 Key Concepts

### Blog Posts
- Stored in MySQL `posts` table
- Accessed via unique `slug` (e.g., `/blog/hello-world`)
- Can be published or drafted
- Track likes and view count
- Automatically generated in Next.js routing

### Comments
- Stored in MySQL `comments` table
- Require admin approval before displaying
- Users can like comments
- Linked to blog posts via `post_id`
- Moderated in admin panel

### Admin Panel
- Access at `/admin` on any page
- Login with `ADMIN_TOKEN`
- View all posts with statistics
- Moderate pending comments
- Approve, reject, or delete comments

### Auto-Deployment
- Push to GitHub
- GitHub Actions runs tests
- Automatically deploys to Vercel
- Your blog is live in seconds!

## 💡 Common Tasks

### Write a New Blog Post
```sql
INSERT INTO posts (slug, title, content, excerpt) VALUES (
  'my-awesome-post',
  'My Awesome Post',
  'Write your content here...',
  'Brief summary'
);
```

### Approve Comments
1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Login with admin token
3. Click approve button on comments

### Update Your Blog
```bash
# Make changes
git add .
git commit -m "Add new blog post"
git push origin main

# Automatically deployed to Vercel!
```

### Change Blog Post Title or Content
```sql
UPDATE posts SET title = 'New Title', content = 'New content' WHERE slug = 'my-post';
```

## 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit
```

## 🎨 Customization

The blog uses **Tailwind CSS** for styling. Modify:
- `styles/globals.css` - Global styles
- `tailwind.config.js` - Color scheme, fonts, etc.
- Page components - Individual page styling

Components can be found in:
- `pages/index.tsx` - Homepage
- `pages/blog/[slug].tsx` - Blog post page
- `pages/admin.tsx` - Admin dashboard

## 🆘 Troubleshooting

### Port 3000 Already In Use
```bash
npm run dev -- -p 3001
```

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env.local
cat .env.local

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Build Fails
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### Comments Not Showing
- Check admin panel for pending comments
- Approve them first before they appear

### Admin Panel Won't Load
- Verify `ADMIN_TOKEN` is correct
- Check it matches between `ADMIN_TOKEN` and `NEXT_PUBLIC_ADMIN_TOKEN`

## 📋 Development Checklist

- [ ] Run `npm install`
- [ ] Copy and configure `.env.local`
- [ ] Verify MySQL is running
- [ ] Start dev server with `npm run dev`
- [ ] Visit homepage [http://localhost:3000](http://localhost:3000)
- [ ] Create test blog post
- [ ] Visit blog post page
- [ ] Test commenting system
- [ ] Access admin panel `/admin`
- [ ] Moderate a comment
- [ ] Push to GitHub
- [ ] Deploy to Vercel (see DEPLOYMENT.md)

## 🎯 Next Steps

1. **Get Local Running**: Follow Quick Start above
2. **Create Content**: Add your first blog posts
3. **Test Everything**: Comments, likes, admin panel
4. **Deploy to Vercel**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Go Live**: Add custom domain and go live!
6. **Enhance**: Add features from the roadmap

## 📞 Getting Help

1. Check relevant documentation file
2. Review GitHub Actions logs
3. Check Vercel deployment logs
4. Test locally first
5. Verify environment variables are correct

## 🎉 You're Ready!

Your personal blog is ready to go. Start with local development, then deploy to Vercel for free hosting with automatic updates!

Happy blogging! ✍️
