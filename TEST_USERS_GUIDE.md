# Test Users Guide

## Overview

Test users with different profiles and roles to test all features of APIMarketplace Pro.

**Test Password (All Users):** `TestPass123!`

---

## Test User Profiles

### 1. Platform Admin 👑
**Email:** `admin@apimarketplace.pro`  
**Password:** `TestPass123!`  
**Role:** Platform Administrator  
**Access:**
- Full admin dashboard
- Feature flags management
- User & organization management
- API review queue
- Implementation tracker
- System health monitoring

**Test Cases:**
- Approve/reject API submissions
- Toggle feature flags
- View platform analytics
- Manage users and organizations
- Monitor system health

---

### 2. Enterprise Provider 🏢
**Email:** `provider.enterprise@acme.com`  
**Password:** `TestPass123!`  
**Organization:** Acme API Corp (Enterprise Plan)  
**Role:** Organization Owner  
**Type:** API Provider

**Profile:**
- Multiple published APIs (Payment API, User API, Analytics API)
- 100+ active subscribers
- $50K+ monthly revenue
- Stripe Connect verified

**Test Cases:**
- View provider analytics dashboard
- Check revenue and subscriber growth
- Monitor API performance
- Review SLA metrics
- Manage pricing plans
- Handle support requests

---

### 3. Pro Provider 💼
**Email:** `provider.pro@devtools.com`  
**Password:** `TestPass123!`  
**Organization:** DevTools Inc (Pro Plan)  
**Role:** Organization Owner  
**Type:** API Provider

**Profile:**
- 2-3 published APIs
- 20-30 active subscribers
- $5K-10K monthly revenue
- Growing provider

**Test Cases:**
- Publish new API with OpenAPI spec
- Set up tiered pricing
- View provider analytics
- Monitor API usage
- Handle subscriber feedback
- Optimize API performance

---

### 4. Free Developer 🚀
**Email:** `developer.free@startup.com`  
**Password:** `TestPass123!`  
**Organization:** Startup Studio (Free Plan)  
**Role:** Organization Owner  
**Type:** Developer

**Profile:**
- 1-2 API subscriptions (free tiers)
- Testing sandbox features
- Limited AI generations (50/day)
- No collaborative features

**Test Cases:**
- Browse API marketplace
- Subscribe to free APIs
- Test APIs in sandbox
- Generate code snippets
- View usage analytics
- Basic features only

---

### 5. Enterprise Developer 🏢
**Email:** `developer.enterprise@corp.com`  
**Password:** `TestPass123!`  
**Organization:** Enterprise Corp (Enterprise Plan)  
**Role:** Organization Owner  
**Type:** Developer (also has provider capabilities)

**Profile:**
- 10+ API subscriptions
- Using governance features
- Team of 20+ developers
- Budget controls active
- Approval workflows enabled

**Test Cases:**
- Browse with governance policies
- Request approval for new APIs
- Use codebase analytics
- View cost allocation
- Manage team members
- Set budget limits
- Use collaborative testing
- Access AI playground unlimited

---

### 6. Pro Developer 💻
**Email:** `developer.pro@solo.dev`  
**Password:** `TestPass123!`  
**Organization:** Solo Developer (Pro Plan)  
**Role:** Organization Owner  
**Type:** Developer

**Profile:**
- 5-7 API subscriptions
- Active AI playground user
- Uses collaborative testing
- 200 AI generations/day
- Creating workflows

**Test Cases:**
- Subscribe to multiple APIs
- Use AI code generation
- Create workflows
- Test APIs collaboratively
- View analytics
- Manage subscriptions
- Generate documentation

---

## How to Create These Users

### Option 1: Sign Up Through UI (Recommended)

```bash
1. Start dev server: npm run dev
2. Go to: http://localhost:3000/signup
3. For each user profile:
   - Enter the email
   - Enter password: TestPass123!
   - Select organization type
   - Complete profile
4. Verify email (check Supabase Auth > Users)
```

### Option 2: Create in Supabase Dashboard

```bash
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. For each profile:
   - Email: [from list above]
   - Password: TestPass123!
   - Confirm password: TestPass123!
   - Email confirm: Yes
4. Click "Create user"
```

### Option 3: Use Supabase Auth API

```bash
# Use this Edge Function or API route
POST /api/admin/create-test-users
```

---

## After Creating Users

### Set Platform Admin
```sql
-- Run in Supabase SQL Editor
UPDATE users 
SET is_platform_admin = true 
WHERE email = 'admin@apimarketplace.pro';
```

### Link Organizations
```sql
-- Link users to their organizations (auto-created on signup)
-- Or manually:
INSERT INTO organization_members (user_id, organization_id, role)
SELECT u.id, o.id, 'owner'
FROM users u, organizations o
WHERE u.email = 'provider.enterprise@acme.com' 
  AND o.slug = 'acme-api-corp';

-- Repeat for other users
```

---

## Testing Scenarios

### Scenario 1: Provider Onboarding
**User:** provider.pro@devtools.com  
**Flow:** 
1. Log in
2. Create new API
3. Upload OpenAPI spec
4. Configure pricing (Free, Pro, Enterprise tiers)
5. Submit for review
6. Wait for admin approval

### Scenario 2: Developer Subscription
**User:** developer.free@startup.com  
**Flow:**
1. Log in
2. Browse marketplace
3. Find API
4. Subscribe to free tier
5. Get API key
6. Test in sandbox
7. View usage dashboard

### Scenario 3: AI Playground
**User:** developer.pro@solo.dev  
**Flow:**
1. Log in
2. Go to AI Playground
3. Ask: "Generate code to create a user"
4. Get streaming response
5. Copy code
6. Test in sandbox

### Scenario 4: Admin Operations
**User:** admin@apimarketplace.pro  
**Flow:**
1. Log in
2. Go to admin dashboard
3. Review pending APIs
4. Approve/reject
5. View platform stats
6. Manage feature flags
7. Check implementation tracker

### Scenario 5: Collaborative Testing
**User:** developer.enterprise@corp.com  
**Flow:**
1. Log in
2. Create collab session
3. Share session code
4. Test API together
5. Chat with team
6. Share responses

---

## Quick Reference

| Email | Password | Type | Plan | Primary Use Case |
|-------|----------|------|------|------------------|
| admin@apimarketplace.pro | TestPass123! | Admin | N/A | Platform administration |
| provider.enterprise@acme.com | TestPass123! | Provider | Enterprise | Large API provider |
| provider.pro@devtools.com | TestPass123! | Provider | Pro | Growing provider |
| developer.free@startup.com | TestPass123! | Developer | Free | Basic developer |
| developer.enterprise@corp.com | TestPass123! | Both | Enterprise | Enterprise team |
| developer.pro@solo.dev | TestPass123! | Developer | Pro | Solo pro developer |

---

## Security Note

**⚠️ IMPORTANT:** These are test users for development only!

- Do NOT use these credentials in production
- Change all test passwords before launch
- Delete test users before going live
- Use real email verification in production

---

## Next Steps

1. **Create the users** via signup UI or Supabase dashboard
2. **Set admin flag** for admin user
3. **Test all flows** with different user profiles
4. **Verify permissions** work correctly
5. **Test feature toggles** as admin

---

**Password for ALL test users:** `TestPass123!`

This makes it easy to switch between different user profiles during testing! 🎉
