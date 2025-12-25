# Deployment Guide

This guide covers deploying the Portfolio Analytics System to Vercel.

## Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] No security vulnerabilities (`npm audit` shows 0 vulnerabilities)
- [ ] Environment variables configured in `.env`
- [ ] Supabase database set up with `visitors` table
- [ ] All files committed to Git
- [ ] `.env` file is in `.gitignore` (never commit secrets)

## Vercel Deployment

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Verify `.gitignore` includes `.env`:
```bash
cat .gitignore | grep ".env"
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select your repository
5. Vercel will auto-detect the configuration from `vercel.json`

### Step 3: Configure Environment Variables

In the Vercel dashboard, add these environment variables:

```
SUPABASE_URL=https://wyandqshrrzgimqlswbx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SB_PUBLISHABLE_KEY=sb_publishable_BfvbJbTN9eAP9pC2Jv0KcQ_nd1wjdMVs
SB_SECRET_KEY=sb_secret__vj_TCJL4JgAdetwLQRdbQ_i-4jjKJU
JWT_SECRET=4fvxDDAqTpEgtlwrqTgFFyisZcewAxkmYfQkLIzI0siOwtJ00dWfyMS5iZTtkTzhlIgr7gBAyq9MOYXHAYaXCQ==
NODE_ENV=production
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be live at `https://your-project.vercel.app`

## Post-Deployment Verification

### Test the Application

1. Visit your deployed URL
2. Check the main dashboard loads correctly
3. Verify analytics endpoints:
   - `https://your-project.vercel.app/api/analytics`
   - `https://your-project.vercel.app/api/health`
   - `https://your-project.vercel.app/api/countries`

### Monitor Logs

In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Select the latest deployment
4. Click "Logs" to view real-time logs

### Check Database Connection

Visit the health endpoint:
```
https://your-project.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "healthy",
  "recentVisitors": 0,
  "timestamp": "2025-12-25T22:47:05.713Z"
}
```

## Troubleshooting

### Build Fails

**Error: Cannot find module**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally and commit `package-lock.json`

**Error: Environment variables not found**
- Verify all variables are set in Vercel dashboard
- Redeploy after adding variables

### Runtime Errors

**Error: Supabase connection failed**
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Ensure database has `visitors` table

**Error: Port already in use**
- Vercel automatically assigns ports
- This shouldn't occur on Vercel

### Performance Issues

**Slow API responses**
- Check Supabase query performance
- Add database indexes on frequently queried columns
- Consider caching strategies

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Update analytics"
git push origin main

# Vercel automatically deploys
```

## Rollback

To rollback to a previous deployment:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find the previous working deployment
4. Click the three dots menu
5. Select "Promote to Production"

## Custom Domain

To add a custom domain:

1. In Vercel dashboard, go to "Settings"
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

## SSL/TLS Certificate

Vercel automatically provides free SSL certificates for all deployments.

## Monitoring and Analytics

### Vercel Analytics

1. Enable Web Analytics in Vercel dashboard
2. View real-time traffic and performance metrics

### Application Logs

Logs are available in:
- Vercel dashboard under "Logs"
- Local file: `./logs/analytics.log` (if enabled)

## Scaling

### Database Scaling

If you experience high traffic:
1. Upgrade Supabase plan
2. Add database indexes
3. Implement caching

### Function Scaling

Vercel automatically scales serverless functions based on demand.

## Security Best Practices

1. **Never commit `.env` file**
   - Use `.env.example` for reference
   - Set variables in Vercel dashboard

2. **Rotate secrets regularly**
   - Update Supabase keys periodically
   - Update JWT secret

3. **Monitor for vulnerabilities**
   - Run `npm audit` regularly
   - Update dependencies

4. **Enable rate limiting**
   - Already configured in the application
   - Adjust limits in `security.js` if needed

## Backup and Recovery

### Database Backups

Supabase provides automatic backups:
1. Go to Supabase dashboard
2. Click "Backups"
3. View backup history

### Manual Backup

Export data from Supabase:
```bash
# Use Supabase CLI
supabase db pull
```

## Support

For deployment issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Supabase documentation: https://supabase.com/docs
3. Review application logs
4. Check GitHub issues

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure custom domain
3. Enable analytics
4. Set up backup strategy
5. Plan scaling strategy
6. Document any customizations
