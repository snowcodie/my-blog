# Blog Customization Feature - Complete Setup Guide

## Overview

Your blog is now fully customizable! The admin panel allows you to:
- **Edit Site Branding**: Change site name, upload logo, set favicon
- **Manage Navigation Sections**: Add, edit, delete, and reorder navigation tabs dynamically
- **Dynamic Content**: Everything updates in real-time across the site

## New Admin Pages

### 1. Site Settings (`/admin/settings`)
Edit your blog's branding and metadata.

**Features:**
- Site Name: The title displayed in the navbar
- Site Description: Shown in meta tags (SEO)
- Logo URL: Display a custom logo in the navbar
- Favicon URL: Browser tab icon

**How to Use:**
1. Log in to admin panel at `/admin`
2. Click the purple "Settings" button
3. Fill in your site information
4. Click "Save Settings"

**Image URLs:**
- Use full URLs (e.g., `https://example.com/logo.png`)
- For development, you can use base64 data URLs
- Recommended sizes:
  - Logo: 160x40px (for navbar display)
  - Favicon: 32x32px or 16x16px

### 2. Navigation Sections (`/admin/nav-sections`)
Manage your blog's category tabs dynamically.

**Features:**
- **Create Sections**: Add new navigation categories
- **Edit Sections**: Modify existing sections
- **Delete Sections**: Remove unwanted sections
- **Active/Inactive**: Toggle section visibility
- **Icon Names**: Use Lucide React icon names (Zap, Code, Book, etc.)

**How to Use:**
1. Log in to admin panel at `/admin`
2. Click the indigo "Nav Sections" button
3. Click "Add Section" to create new
4. Fill in:
   - **Name**: Display text (e.g., "Technology")
   - **Slug**: URL identifier (e.g., "technology")
   - **Icon**: Lucide icon name (e.g., "Code")
   - **Description**: Hover text (optional)
   - **Active**: Toggle to show/hide
5. Click "Save" to create

**Editing/Deleting:**
- Click the edit icon (pencil) to modify
- Click the delete icon (trash) to remove

## API Endpoints

### Settings API
```
GET /api/settings
- Returns current site settings or defaults
- No authentication required
- Response: { site_name, site_logo, site_favicon, site_description }

PUT /api/settings
- Updates site settings
- Requires: Valid JWT cookie (admin login)
- Body: { site_name, site_logo, site_favicon, site_description }
- Response: { success: true, message: "..." }
```

### Navigation Sections API
```
GET /api/nav-sections
- Returns all active navigation sections ordered by index
- No authentication required
- Response: Array of nav sections

POST /api/nav-sections
- Creates new navigation section
- Requires: Valid JWT cookie (admin login)
- Body: { name, slug, icon, description, active }
- Response: { success: true, message: "..." }

PUT /api/nav-sections/[id]
- Updates navigation section
- Requires: Valid JWT cookie
- Body: { name, slug, icon, description, active, order_index }
- Response: { success: true, message: "..." }

DELETE /api/nav-sections/[id]
- Deletes navigation section
- Requires: Valid JWT cookie
- Response: { success: true, message: "..." }
```

## Database Changes

### site_settings Table
```sql
CREATE TABLE site_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(255) NOT NULL,
  site_logo TEXT,
  site_favicon TEXT,
  site_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### nav_sections Table
```sql
CREATE TABLE nav_sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  category_id INT,
  order_index INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## Navigation Sections Implementation

### Adding Your First Section
1. Go to `/admin/nav-sections`
2. Click "Add Section"
3. Fill in details:
   - Name: `Technology`
   - Slug: `technology`
   - Icon: `Code`
   - Description: `Software & Development`
   - Active: ✓
4. Click "Save"

### Lucide Icon Examples
Common icons you can use:
- `Code` - for programming topics
- `Zap` - for electrical/power topics
- `Book` - for learning/reading topics
- `MapPin` - for travel topics
- `Wrench` - for DIY/mechanical topics
- `Lightbulb` - for ideas/insights
- `Github` - for development
- `Coffee` - for lifestyle
- `Camera` - for photography
- `Music` - for audio/music

**Note**: Icon display is currently using a fallback. To use different icons, you'll need to import them dynamically in Navbar.tsx.

## How It Works

### 1. Navbar Gets Dynamic Data
When the page loads, Navbar fetches:
- Site settings from `/api/settings`
- Navigation sections from `/api/nav-sections`

### 2. Admin Updates Data
When admin changes settings:
- PUT request to `/api/settings` saves to database
- POST/PUT/DELETE requests to `/api/nav-sections` modify sections
- Data is persisted in MySQL database

### 3. Changes Appear Immediately
Navbar refreshes its data on mount, so:
- Refresh the page to see new settings
- New sections appear in the navbar
- Site name and logo update everywhere

## Complete Admin Dashboard Features

Now your admin dashboard includes:

| Feature | Location | Access |
|---------|----------|--------|
| **Site Settings** | `/admin/settings` | Admin only |
| **Navigation Sections** | `/admin/nav-sections` | Admin only |
| **Pending Comments** | `/admin` | Admin only |
| **Posts Management** | `/admin` | Admin only |
| **Create Admin User** | `/admin/create-user` | Public |

## Navbar Improvements

The navbar now features:
- ✓ Dynamic site name (from database)
- ✓ Custom logo support (from database)
- ✓ Dynamic navigation sections (from database)
- ✓ Modern responsive design
- ✓ Dark/light theme toggle
- ✓ Mobile hamburger menu
- ✓ Post count per category

## Testing the Feature

### Step 1: Verify Initial Setup
```bash
npm run dev
# Visit http://localhost:3000
# Check navbar shows "My Blog" with default icon
```

### Step 2: Update Site Settings
```
1. Click Admin button → Login
2. Click purple "Settings" button
3. Change site name to "My Awesome Blog"
4. Add a logo URL (or use a placeholder)
5. Click "Save Settings"
6. Refresh page - should see new name
```

### Step 3: Add Navigation Sections
```
1. From admin dashboard, click indigo "Nav Sections"
2. Click "Add Section"
3. Fill in:
   - Name: ones&zeros
   - Slug: ones-zeros
   - Icon: Code
   - Active: ✓
4. Click "Save"
5. Refresh homepage - section appears in navbar
```

### Step 4: Create Blog Post
```
1. Create a post with category matching your section slug
2. Post appears under that category tab
3. Section shows post count automatically
```

## Troubleshooting

### Settings Won't Save
- Ensure you're logged in as admin
- Check browser console for error messages
- Verify MySQL connection is working
- Check `/api/settings` endpoint returns data

### Nav Sections Not Appearing
- Verify sections are marked as "Active"
- Check `/api/nav-sections` returns your sections
- Refresh the page (navbar fetches on mount)
- Check browser console for fetch errors

### Logo Not Showing
- Use full HTTPS URLs for images
- Verify image URL is accessible in browser
- Try using a placeholder service like `https://via.placeholder.com/160x40`

### Admin Buttons Not Visible
- Ensure you're authenticated (check cookies)
- Refresh the page after login
- Clear browser cache if issues persist

## Database Initialization

Tables are created automatically when:
1. You first access the blog
2. Any API route queries the database
3. The initialization endpoint is called

If tables don't exist, the system will create them with proper schema.

## Environment Variables

Ensure these are set in `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_blog
JWT_SECRET=your-secret-key-here
```

## Next Steps

### Optional Enhancements
1. **File Upload**: Replace URL inputs with file upload for logo/favicon
2. **Image Hosting**: Use AWS S3 or Cloudinary for image storage
3. **Icon Library**: Dynamically load Lucide icons based on icon name
4. **Drag & Drop**: Add drag-to-reorder functionality for nav sections
5. **Custom CSS**: Allow custom theme colors from admin panel

### Deploy to Vercel
```bash
# Push to GitHub
git add .
git commit -m "Add customizable admin panel"
git push origin main

# Auto-deployment via GitHub Actions
# Vercel will deploy automatically
```

## File Structure

```
app/
├── admin/
│   ├── settings/
│   │   └── page.tsx          # NEW: Site settings page
│   ├── nav-sections/
│   │   └── page.tsx          # NEW: Nav sections management
│   └── page.tsx              # Updated with new links
│
├── api/
│   ├── settings/
│   │   └── route.ts          # NEW: GET/PUT settings
│   ├── nav-sections/
│   │   ├── route.ts          # NEW: GET/POST sections
│   │   └── [id]/
│   │       └── route.ts      # NEW: PUT/DELETE section
│   └── ...
│
├── components/
│   └── Navbar.tsx            # Updated: Fetches dynamic data
│
└── ...

lib/
└── db.ts                      # Updated: Added 2 new tables
```

## Security Notes

All admin endpoints are protected with JWT authentication:
- HTTP-only cookies store the token
- Tokens expire after 7 days
- PUT/POST/DELETE operations require valid token
- GET operations are public (for navbar to work)

## Summary

Your blog is now a **fully customizable, admin-controlled platform** where:
- ✅ Site branding can be changed without code
- ✅ Navigation sections are managed from database
- ✅ All changes persist across sessions
- ✅ Changes appear in real-time after refresh
- ✅ Admin panel is intuitive and modern

**Start customizing your blog now!** 🎉
