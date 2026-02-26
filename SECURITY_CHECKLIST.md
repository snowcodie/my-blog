# Security Checklist for Production Deployment

## ✅ Completed Security Features

1. **JWT Authentication** with httpOnly cookies
2. **SQL Injection Prevention** via parameterized queries
3. **CSRF Protection** via SameSite cookies
4. **XSS Protection** via httpOnly cookies
5. **Rate Limiting** on login endpoint (5 attempts per 15 minutes)
6. **Timing Attack Prevention** using crypto.timingSafeEqual()
7. **Brute Force Delay** (1 second delay on failed login)

## 🔒 CRITICAL: Before Deploying to Production

### 1. Generate Strong JWT Secret
```bash
# Generate a strong random secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set this in your environment variables:
```env
JWT_SECRET=your-generated-64-character-hex-string-here
```

**⚠️ NEVER use the default 'your-secret-key-change-this'!**

### 2. Generate Strong Admin Token
```bash
# Generate a strong admin token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set in environment:
```env
ADMIN_TOKEN=your-generated-admin-token-here
```

### 3. Secure Database Credentials
Never commit these to Git:
```env
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASSWORD=strong-random-password
DB_NAME=my_blog
```

### 4. Vercel Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:
- `JWT_SECRET` (same as local)
- `ADMIN_TOKEN` (same as local)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Set all to **Production** environment

### 5. Enable HTTPS (Automatic on Vercel)
Vercel automatically provides SSL certificates. Ensure:
- Force HTTPS redirects are enabled
- Never access admin panel over HTTP

## 🛡️ Recommended Additional Security (Optional but Highly Recommended)

### 1. Upgrade Password Hashing to bcrypt

**Current**: Uses SHA-256 (weak for passwords)  
**Recommended**: Use bcrypt or Argon2

Install bcrypt:
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

Update `app/api/admin/login/route.ts`:
```typescript
import bcrypt from 'bcrypt';

// When checking password:
const isMatch = await bcrypt.compare(password, admin.password_hash);
```

Update `app/api/admin/create-user/route.ts`:
```typescript
import bcrypt from 'bcrypt';

// When creating user:
const hashedPassword = await bcrypt.hash(password, 12);
```

### 2. Add Content Security Policy (CSP)

In `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 3. Implement Proper Rate Limiting

For production, use a proper rate limiter:
```bash
npm install @upstash/ratelimit @upstash/redis
```

Or use Vercel's built-in rate limiting (Pro plan).

### 4. Add 2FA (Two-Factor Authentication)

Consider adding TOTP-based 2FA for admin accounts using:
```bash
npm install speakeasy qrcode
```

### 5. Database Security

#### Enable SSL/TLS for MySQL connection:
```typescript
const pool = mysql.createPool({
  // ... existing config
  ssl: {
    rejectUnauthorized: true
  }
});
```

#### Regular Backups:
- Set up automated daily backups
- Store backups in a separate secure location
- Test restore procedures monthly

### 6. Monitoring & Logging

Add security logging:
```typescript
// Log all admin actions
console.log(`[ADMIN] User ${username} performed action: ${action}`);

// Log failed login attempts
console.warn(`[SECURITY] Failed login attempt from IP: ${ip}`);
```

Consider using services like:
- Sentry for error tracking
- LogRocket for user session recording
- Vercel Analytics for traffic monitoring

### 7. Regular Security Updates

```bash
# Check for vulnerabilities weekly
npm audit

# Update dependencies monthly
npm update

# Check for critical security patches
npm audit fix
```

## 🚨 Security Incident Response

If you suspect a breach:

1. **Immediately rotate secrets**:
   - Generate new JWT_SECRET
   - Generate new ADMIN_TOKEN
   - Change database password

2. **Check logs** for suspicious activity

3. **Review all posts** for unauthorized changes

4. **Enable maintenance mode** temporarily

5. **Analyze** what happened and patch vulnerabilities

## 📋 Pre-Deployment Security Checklist

- [ ] Strong JWT_SECRET set (64+ characters)
- [ ] Strong ADMIN_TOKEN set (64+ characters)
- [ ] Database credentials are secure
- [ ] All environment variables set in Vercel
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Rate limiting tested
- [ ] No sensitive data in Git repository
- [ ] `.env.local` is in `.gitignore`
- [ ] Database backups configured
- [ ] Admin login tested in production
- [ ] Password hashing upgraded to bcrypt (recommended)
- [ ] Security headers configured (recommended)

## 🔐 Current Security Level

**Basic Protection**: ⭐⭐⭐☆☆ (3/5)

Your current setup protects against:
- ✅ SQL Injection
- ✅ XSS attacks
- ✅ CSRF attacks
- ✅ Basic brute force (with rate limiting)

Weak points:
- ⚠️ Password hashing (SHA-256 instead of bcrypt)
- ⚠️ No 2FA
- ⚠️ Basic rate limiting (memory-based, resets on deploy)
- ⚠️ No audit logging

**With Recommended Upgrades**: ⭐⭐⭐⭐⭐ (5/5)

## 📞 Emergency Contacts

If you need to lock down the site immediately:

1. In Vercel Dashboard → Deployments → ... → Redeploy
2. Remove ADMIN_TOKEN from environment variables
3. This will block all admin access until you restore it

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security](https://vercel.com/docs/security/overview)
