# Vercel Deployment Guide - PharmaCare

This guide provides step-by-step instructions to deploy PharmaCare to Vercel.

## Prerequisites

- GitHub repository with the project
- Vercel account ([vercel.com](https://vercel.com))
- Convex project deployed
- Clerk application configured

## Environment Variables

Add these variables in **Vercel → Settings → Environment Variables**:

```
VITE_API_BASE_URL=https://pharmacare-api.onrender.com/api
VITE_APP_NAME=PharmaCare
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
VITE_TOKEN_EXPIRY_MINUTES=30
VITE_SESSION_TIMEOUT_MINUTES=60
VITE_RATE_LIMIT_REQUESTS=100
VITE_RATE_LIMIT_WINDOW_MS=60000
VITE_MAX_FILE_SIZE_MB=5
VITE_ALLOWED_FILE_TYPES=.xlsx,.xls,.csv
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=50
VITE_CONVEX_URL=https://enduring-owl-795.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c3F1YXJlLXBvbGVjYXQtNy5jbGVyay5hY2NvdW50cy5kZXYk
```

## Deployment Steps

### 1. Push to GitHub

Ensure all files are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import from GitHub
4. Select your repository
5. Click **"Import"**

### 3. Configure Project Settings

Vercel should auto-detect the settings. Verify:

- **Framework Preset**: Vite
- **Root Directory**: `./program`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

The `vercel.json` file at the root will override these settings if needed.

### 4. Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add each variable from the list above
4. Select **Production** environment
5. Click **Save**

Repeat for all 14 variables.

### 5. Add Convex Integration

1. Go to **Integrations** tab in your project
2. Search for **"Convex"**
3. Click **"Install"**
4. Authorize Vercel to access your Convex account
5. Select your Convex project: `enduring-owl-795`
6. Vercel will automatically add the `CONVEX_DEPLOYMENT` variable

### 6. Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete
3. You'll receive a Vercel URL (e.g., `pharmacare.vercel.app`)

### 7. Add Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain name
4. Follow the DNS configuration instructions

## Post-Deployment Verification

After deployment, verify:

- [ ] Website loads at the Vercel URL
- [ ] Clerk authentication works (login/signup)
- [ ] Convex database queries return data
- [ ] Convex mutations execute successfully
- [ ] API calls to Render backend work
- [ ] File uploads work (if applicable)
- [ ] All dashboard routes are accessible
- [ ] Responsive design works on mobile

## Troubleshooting

### Build Fails

Check the **Build Logs** in Vercel for errors. Common issues:

- Missing dependencies: Ensure `package.json` is correct
- Environment variables missing: Verify all variables are added
- Convex connection issues: Check `VITE_CONVEX_URL`

### Authentication Issues

- Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- Check Clerk dashboard for application settings
- Ensure allowed origins include your Vercel domain

### Convex Issues

- Verify Convex project URL: `https://enduring-owl-795.convex.cloud`
- Check Convex dashboard for function errors
- Ensure Convex integration is properly connected in Vercel

### Environment Variables Not Working

- Variables must start with `VITE_` to be available in client-side code
- Redeploy after adding environment variables
- Check you're using Production environment variables

## Production Considerations

### Clerk Keys

You're currently using a test key (`pk_test_`). For production:

1. Go to Clerk Dashboard
2. Navigate to your application
3. Find the **Publishable Key** section
4. Copy the production key (starts with `pk_live_`)
5. Update `VITE_CLERK_PUBLISHABLE_KEY` in Vercel
6. Redeploy

### Convex Production

Your Convex URL is already production-ready. No changes needed.

### API Backend

Ensure your Render API (`https://pharmacare-api.onrender.com/api`) is also in production mode.

## Monitoring

- **Vercel Analytics**: Monitor performance and visitor data
- **Vercel Logs**: Check real-time logs for errors
- **Convex Dashboard**: Monitor database operations and function executions
- **Clerk Dashboard**: Monitor authentication events

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Convex Documentation: [docs.convex.dev](https://docs.convex.dev)
- Clerk Documentation: [clerk.com/docs](https://clerk.com/docs)

## Summary

Your project is now configured for Vercel deployment with:

- ✅ `vercel.json` configuration
- ✅ Root-level `package.json`
- ✅ Environment variable template
- ✅ Convex integration ready
- ✅ Clerk authentication configured

Deploy now by following the steps above!
