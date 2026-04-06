# Google OAuth Setup Guide 🔐

## What Changed
✅ App now redirects from home to login/dashboard automatically  
✅ OAuth callback handling improved  
✅ Google sign-in button on login page ready

## Setup Steps

### Step 1: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Search for **"OAuth consent screen"** in top search
4. Click **"Create" or "Edit"**
5. Choose **"External"** for User Type
6. Fill in app name: **HealthVision AI**
7. Add email and continue

### Step 2: Create OAuth 2.0 Credentials
1. Go to **Credentials** in left menu
2. Click **"+ Create Credentials"** → **OAuth client ID**
3. Choose **"Web application"**
4. Add **Authorized redirect URIs**:
   ```
   http://localhost:8080/auth/callback
   http://localhost:3000/auth/callback
   ```
   (Add your production URL later)
5. Copy **Client ID** and **Client Secret**

### Step 3: Configure Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Enable **Google**
5. Paste your credentials:
   - **Client ID** (from Google Cloud)
   - **Client Secret** (from Google Cloud)
6. Click **Save**

### Step 4: Verify Supabase Redirect URL
1. Still in Supabase Providers (Google)
2. Check **Authorized redirect URIs** - should be:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
   (Supabase adds this automatically)

### Step 5: Test It! 🚀
1. Go to **http://localhost:8080/**
2. You should see the **Login** page
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. You'll be redirected to **Dashboard**

## Environment Variables (if needed)
No additional env vars needed! Lovable handles it automatically.

## Troubleshooting

### White screen / 404 error
✅ Fixed! App now redirects correctly

### "Google sign-in failed"
- Check Google Cloud OAuth credentials are correct
- Verify redirect URIs in Google Cloud include `http://localhost:8080/auth/callback`
- Check Supabase has Google enabled with credentials

### Stuck on "Verifying authentication"
- Check browser console (F12) for errors
- Verify internet connection
- Make sure Supabase project is active

### Login button doesn't appear
- Hard refresh browser (Ctrl+F5)
- Check that auth is working (try email/password first)
- Clear browser cache

## Production Setup
When deploying:
1. Add production redirect URIs to Google Cloud
2. Add production domain to Supabase
3. Update environment variables if needed
4. Test Google login on production domain

## File Changes Made
- `src/App.tsx` - Added RootRoute to skip intro page
- `src/pages/AuthCallback.tsx` - Improved OAuth handling
- `src/pages/Auth.tsx` - Better Google OAuth redirect URI

## Current Flow
```
localhost:8080/
    ↓
Check if logged in?
    ↓
    ├─ YES → Redirect to /dashboard
    └─ NO → Redirect to /auth (Login page)
         ↓
         Click "Continue with Google"
         ↓
         Google login popup
         ↓
         Redirect to /auth/callback
         ↓
         Verify session
         ↓
         Redirect to /dashboard ✅
```

## Next Steps
1. Set up Google OAuth credentials
2. Test login with Google
3. Try email/password signup
4. Test medical analysis with Bengali support
5. Deploy to production!

---

**Status:** ✅ Ready for Google OAuth  
**Date:** April 6, 2026
