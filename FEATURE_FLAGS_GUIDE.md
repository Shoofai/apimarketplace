# Feature Flags Quick Guide

## What Was Added

A complete feature flag system that lets platform admins control the application behavior without code changes.

### Database
- Created `feature_flags` table
- 4 default flags configured:
  - **launch_page_enabled** (OFF by default) - Toggle between marketing launch page and app home
  - **maintenance_mode** (OFF) - Enable maintenance mode
  - **new_signups_enabled** (ON) - Allow new user registrations
  - **ai_playground_enabled** (ON) - Enable AI features

### Admin UI
- Feature flags management page at `/dashboard/admin/feature-flags`
- Toggle switches for each flag
- Real-time updates
- Flag descriptions and usage info

### Home Page Behavior
- **Launch Page OFF (default):** Shows simplified app home page with features grid
- **Launch Page ON:** Shows full marketing landing page

---

## How to Use

### 1. Access Feature Flags
```
1. Log in as platform admin
2. Go to: /dashboard/admin/feature-flags
3. Toggle any flag on/off
4. Changes apply immediately
```

### 2. Current Setup
By default (as you requested):
- ✅ Launch page is **OFF** - You'll see the app home page
- ✅ You can browse marketplace, sign up, and use the app
- ✅ Admin can toggle it ON anytime to show marketing page

### 3. Make Yourself Platform Admin
```sql
-- Run this in Supabase SQL Editor:
UPDATE users 
SET is_platform_admin = true 
WHERE email = 'your-email@example.com';
```

---

## What You'll See Now

**Current (launch_page_enabled = false):**
- Clean app home page
- "Browse APIs" and "Get Started" CTAs
- Features grid (AI Generation, Real-Time Testing, Enterprise, Analytics)
- Quick links to Marketplace, Playground, Sandbox
- Simple CTA section
- Footer

**If You Enable Launch Page:**
- Full marketing landing page
- Problem statement
- Value propositions
- Killer features showcase
- Tech showcase
- Social proof
- Pricing
- Comparison table
- Network effects
- Final CTA

---

## API Endpoints

```typescript
// Get all flags
GET /api/admin/feature-flags

// Update specific flag
PATCH /api/admin/feature-flags/[key]
Body: { is_enabled: true|false }
```

---

## In Code

```typescript
// Check flag in server components
import { getFeatureFlag } from '@/lib/utils/feature-flags';

const isEnabled = await getFeatureFlag('launch_page_enabled');
```

---

## Next Steps

1. **Visit your site** - You should now see the app home page (not the launch page)
2. **Make yourself admin** - Run the SQL query above
3. **Access feature flags** - Go to `/dashboard/admin/feature-flags`
4. **Toggle as needed** - Switch between launch page and app home

**Feature flags are now live and pushed to GitHub!** ✅
