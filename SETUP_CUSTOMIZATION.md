# Admin Panel Customization - Quick Setup

## ✅ What Has Been Created

Your blog now has a complete customizable admin panel with the following new features:

### 1. **Admin Settings Page** (`/admin/settings`)
- Edit site name
- Upload/add custom logo URL
- Add favicon URL  
- Edit site description
- All changes persist to the database

### 2. **Navigation Sections Management** (`/admin/nav-sections`)
- Create new navigation sections (categories)
- Edit existing sections
- Delete sections with confirmation
- Toggle sections active/inactive
- Reorder sections (via order_index)
- All sections appear in navbar automatically

### 3. **Updated Admin Dashboard** (`/admin`)
- New "Settings" button (purple)
- New "Nav Sections" button (indigo)
- All other functionality preserved

### 4. **Dynamic Navbar**
- Fetches site name from database
- Displays custom logo if provided
- Shows navigation sections from database instead of hardcoded
- Automatically counts posts per section
- Dark/light theme support maintained

### 5. **New Database Tables**
```sql
site_settings (id, site_name, site_logo, site_favicon, site_description)
nav_sections (id, name, slug, icon, description, category_id, order_index, active)
```

### 6. **New API Endpoints**
```
GET  /api/settings                    # Get site settings
PUT  /api/settings                    # Update settings (admin only)
GET  /api/nav-sections                # Get navigation sections
POST /api/nav-sections                # Create new section (admin only)
PUT  /api/nav-sections/[id]          # Update section (admin only)
DELETE /api/nav-sections/[id]        # Delete section (admin only)
GET  /api/init                        # Initialize database tables
```

## 🚀 Getting Started

### Step 1: Initialize Database Tables

**Option A: Using Browser**
Open your browser and visit:
```
http://localhost:3000/api/init?secret=change-this-secret
```

**Option B: Using curl (if terminal is available)**
```bash
curl -X GET "http://localhost:3000/api/init" \
  -H "Authorization: Bearer change-this-secret"
```

**Option C: Manual SQL**
Run these commands in your MySQL client:

```sql
-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(255) DEFAULT 'My Blog',
  site_logo TEXT,
  site_favicon TEXT,
  site_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create nav_sections table  
CREATE TABLE IF NOT EXISTS nav_sections (
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
);
```

### Step 2: Access Settings

1. Navigate to `http://localhost:3000/admin`
2. Login with your admin credentials
3. Click the purple "Settings" button
4. Update your site name, logo, favicon, and description
5. Click "Save Settings"
6. Refresh the page - navbar updates!

### Step 3: Add Navigation Sections

1. From admin dashboard, click indigo "Nav Sections" button
2. Click "Add Section"
3. Fill in:
   - **Name**: Display name (e.g., "Technology")
   - **Slug**: URL identifier (e.g., "technology") 
   - **Icon**: Lucide icon name (e.g., "Code", "Zap", "Book")
   - **Description**: Hover text (optional)
   - **Active**: Toggle to show/hide
4. Click "Save"
5. Refresh homepage - section appears in navbar!

### Step 4: Create Blog Posts

Create posts with the category matching your section slug:
- Section slug: `technology` → Post category: `technology`
- Section slug: `travel` → Post category: `travel`

Post counts update automatically in navbar!

## 📁 New Files Created

```
app/admin/
├── settings/
│   └── page.tsx              ← Site settings management UI
└── nav-sections/
    └── page.tsx              ← Navigation sections management UI

app/api/
├── settings/
│   └── route.ts              ← GET/PUT site settings
├── nav-sections/
│   ├── route.ts              ← GET/POST nav sections
│   └── [id]/
│       └── route.ts          ← PUT/DELETE individual sections
└── init/
    └── route.ts              ← Database initialization

app/components/
└── Navbar.tsx                ← UPDATED: Now fetches from database

CUSTOMIZATION_GUIDE.md        ← Detailed customization documentation
```

## 🔒 Security Notes

- All modification endpoints (PUT, POST, DELETE) require JWT authentication
- Settings and nav sections GET endpoints are public (for navbar to work)
- Initialize endpoint requires Bearer token header
- JWT tokens stored in HTTP-only cookies (7-day expiration)

## ⚙️ Environment Variables

Add to `.env.local` if using custom init secret:
```env
INIT_SECRET=your-secret-key-here
```

Default is `change-this-secret`

## 🎨 Customization Examples

### Example 1: Tech Blog
```
Site Settings:
- Site Name: "Tech Odyssey"
- Logo: https://example.com/logo.png
- Description: "Musings on software and technology"

Nav Sections:
1. ones&zeros (slug: ones-zeros) - Icon: Code
2. DevOps (slug: devops) - Icon: Server
3. AI/ML (slug: ai-ml) - Icon: Brain
```

### Example 2: Travel Blog
```
Site Settings:
- Site Name: "World Wanderer"
- Logo: https://example.com/travel-logo.png

Nav Sections:
1. Europe (slug: europe) - Icon: MapPin
2. Asia (slug: asia) - Icon: MapPin
3. Americas (slug: americas) - Icon: MapPin
```

## 🐛 Troubleshooting

### Tables Don't Exist Error
- Visit `/api/init` with the correct authorization header
- Or manually run the SQL commands above

### Settings Won't Save
- Ensure you're logged in as admin
- Check browser console for error messages
- Verify JWT cookie exists: open DevTools → Application → Cookies

### Logo Not Displaying
- Use full HTTPS URLs
- Test image URL directly in browser
- Verify CORS headers allow image loading

### Nav Sections Not Showing
- Verify sections are marked as "Active"
- Check that section slugs match post categories
- Refresh page (navbar fetches on mount)

## 📚 Further Reading

See [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) for comprehensive documentation.

## 🎯 Next Steps

1. **Initialize Database** - Run the init endpoint
2. **Update Settings** - Add your site branding
3. **Create Sections** - Define your blog categories
4. **Create Posts** - Posts will appear under matching sections
5. **Deploy** - Push to GitHub, auto-deploys to Vercel

## ✨ Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Edit Site Name | ✅ Done | /admin/settings |
| Upload Logo | ✅ Done | /admin/settings |
| Set Favicon | ✅ Done | /admin/settings |
| Create Nav Sections | ✅ Done | /admin/nav-sections |
| Edit Sections | ✅ Done | /admin/nav-sections |
| Delete Sections | ✅ Done | /admin/nav-sections |
| Dynamic Navbar | ✅ Done | Automatic |
| Reorder Sections | ✅ Done (via order_index) | /admin/nav-sections |

---

**Your customizable blog is ready!** 🎉

For production deployment, remember to:
- Change `INIT_SECRET` to a strong random value
- Update `.env` variables on Vercel
- Test all customization flows before deploying
