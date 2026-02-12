# Deployment Guide

## Prerequisites

1. Supabase project set up with all required tables
2. Vercel account
3. GitHub repository with the code

## Vercel Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit: Complete landing page implementation"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://qdhbglnbnlmmtwjjyuwy.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (from Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase dashboard > Settings > API)
- `NEXT_PUBLIC_SITE_URL` = `https://your-domain.vercel.app`

### 4. Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Run build
- Deploy to production
- Provide a URL (e.g., `apimarketplace-pro.vercel.app`)

### 5. Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain (e.g., `apimarketplace.pro`)
3. Configure DNS records as shown by Vercel
4. Wait for DNS propagation (5-30 minutes)
5. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

## Post-Deployment Checklist

- [ ] Visit the deployed URL and verify all sections load
- [ ] Test all CTA buttons
- [ ] Check analytics tracking in Supabase
- [ ] Test waitlist signup
- [ ] Test feature modals
- [ ] Verify mobile responsiveness
- [ ] Run Lighthouse audit (target 95+)
- [ ] Test in different browsers
- [ ] Check console for any errors
- [ ] Verify OG images and social sharing

## Monitoring

### Vercel Analytics

Vercel provides built-in analytics:
- Real User Monitoring (RUM)
- Web Vitals tracking
- Geographic distribution

### Supabase Analytics

Check your Supabase tables for:
- Page views
- CTA clicks
- Feature interactions
- Waitlist signups

## Troubleshooting

### Build Errors

If build fails:
1. Check Vercel build logs
2. Ensure all environment variables are set
3. Verify TypeScript compilation: `npm run type-check`
4. Check for missing dependencies

### Runtime Errors

If the site loads but has errors:
1. Check browser console
2. Verify Supabase connection
3. Check environment variables are correct
4. Review server logs in Vercel dashboard

### Performance Issues

If Lighthouse scores are low:
1. Optimize images (use Next.js Image component)
2. Reduce JavaScript bundle size
3. Enable caching headers
4. Use lazy loading for below-fold content

## Continuous Deployment

Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Runs build checks before deployment
- Provides instant rollback if needed

## Scaling

As traffic grows:
- Vercel automatically scales
- Supabase has usage limits (check dashboard)
- Consider upgrading Supabase plan if needed
- Monitor performance in Vercel Analytics

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
