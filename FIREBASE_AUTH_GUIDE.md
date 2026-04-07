# Firebase Google Authentication Guide

## Overview

Complete Firebase Google Authentication implementation for HealthVision AI using Firebase v9+ modular SDK.

## Files Created

### 1. **src/services/firebase.js** - Firebase Configuration
- Initializes Firebase with your project credentials
- Sets up Analytics (optional)
- Exports auth instance for use throughout app

**Features:**
- Modern Firebase v9+ modular syntax
- Error handling with graceful fallbacks
- Analytics integration (optional)

### 2. **src/services/auth.js** - Authentication Helpers
- `googleSignIn()` - Sign in with Google popup
- `googleSignOut()` - Sign out user
- `onAuthStateListener(callback)` - Real-time auth state tracking
- `getCurrentUser()` - Get current user synchronously
- `isAuthenticated()` - Check if user is logged in
- `getAuthInstance()` - Access raw auth object

**Error Handling Covers:**
- Popup blocked errors
- Unauthorized domain errors
- Network failures
- User cancellation
- All Firebase error scenarios

### 3. **src/components/GoogleLogin.tsx** - React Login Component
Full-featured login component with:
- Google Sign-In button
- User profile display after login
- Logout button
- Loading states
- Error messages
- Bilingual support (English + Bengali)
- Mobile-responsive design
- Real-time authentication state management

## Project Configuration

**Firebase Project:** `healthvision-ai-e647d`
**Auth Providers:** Google OAuth 2.0

## Setup Instructions

### Step 1: Verify Firebase Installation
```bash
npm list firebase
```

Should show: `firebase@^9.23.0` or newer

### Step 2: Configure Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **healthvision-ai-e647d**
3. Navigate to **Authentication** → **Providers**
4. Enable **Google** provider
5. Add authorized domains:
   - `localhost` (development)
   - Your production domain

### Step 3: Use GoogleLogin Component

In your pages or components:

```tsx
import GoogleLogin from '@/components/GoogleLogin';

export default function LoginPage() {
  return (
    <div>
      <GoogleLogin />
    </div>
  );
}
```

### Step 4: Integrate with Navbar

The Navbar has been updated to:
- Display Firebase user profile when logged in
- Show user dropdown menu on desktop
- Show user profile in mobile menu
- Handle logout with Firebase
- Maintain backward compatibility with existing auth

## Component Integration

### Using Auth Functions in Components

```tsx
import { useState, useEffect } from 'react';
import { googleSignIn, onAuthStateListener, getCurrentUser } from '@/services/auth';

function MyComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Monitor auth state
    const unsubscribe = onAuthStateListener((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const user = await googleSignIn();
      console.log('User:', user);
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return (
    <div>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## User Object Structure

After successful login, user object contains:

```typescript
{
  uid: string;              // Unique user ID
  email: string;            // User email
  name: string;             // Display name
  photoURL: string;         // Profile picture URL
  emailVerified: boolean;   // Email verification status
  createdAt: Date;          // Account creation time
  lastSignInTime: Date;     // Last login time
  token: string;            // JWT token
}
```

## Protecting Routes

To protect medical features behind authentication:

```tsx
import { useEffect, useState } from 'react';
import { onAuthStateListener } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

function ProtectedComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateListener((currentUser) => {
      if (!currentUser) {
        navigate('/auth');
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content for {user.name}</div>;
}
```

## Testing the Implementation

### Test Login Flow

1. Start dev server:
```bash
npm run dev
```

2. Navigate to auth page or click "Get Started"

3. Click "Continue with Google"

4. Select a Google account

5. Verify:
   - User profile displays with name, email, photo
   - Profile appears in Navbar dropdown
   - Logout button works
   - Auth state persists on page refresh

### Test Data

Use these test accounts (if configured in Firebase project):
- Any Google account you own
- Verify popup isn't blocked
- Verify domain is authorized

## Troubleshooting

### Issue: "Popup was blocked"
**Solution:** 
- Ensure popup blocker is disabled
- Check browser console for exact error
- Verify authorized domains in Firebase Console

### Issue: "Domain not authorized"
**Solution:**
```
1. Firebase Console → Authentication → Settings
2. Add your domain to authorized list
3. Wait 2-3 minutes for propagation
```

### Issue: User not persisting on page refresh
**Solution:**
- Check browser DevTools → Application → Local Storage
- Verify Firebase is storing tokens
- Check browser console for errors

### Issue: Google button shows error immediately
**Solution:**
- Verify Firebase config in `src/services/firebase.js`
- Check API key matches Firebase project
- Verify Google OAuth provider is enabled

## Production Deployment

### Pre-Deployment Checklist

✅ Firebase config matches production project
✅ All authorized domains added to Firebase Console
✅ Google OAuth scopes configured
✅ Test with real Google account
✅ SSL certificate installed (HTTPS required)
✅ Environment variables secured

### Deploy Steps

1. Update Firebase config for production:
```javascript
// src/services/firebase.js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
```

2. Set environment variables in deployment platform

3. Verify auth works in production

## API Reference

### googleSignIn()
```typescript
async function googleSignIn(): Promise<User>
```
Signs in user with Google popup. Returns user object or throws error.

### googleSignOut()
```typescript
async function googleSignOut(): Promise<void>
```
Signs out current user.

### onAuthStateListener(callback)
```typescript
function onAuthStateListener(callback: (user: User | null) => void): () => void
```
Monitors auth state changes. Returns unsubscribe function.

### getCurrentUser()
```typescript
function getCurrentUser(): User | null
```
Returns currently logged-in user or null.

### isAuthenticated()
```typescript
function isAuthenticated(): boolean
```
Returns true if user is logged in.

### getAuthInstance()
```typescript
function getAuthInstance(): Auth
```
Returns Firebase Auth instance for advanced usage.

## Bilingual Support

GoogleLogin component supports English and Bengali:
- Uses i18n from existing app configuration
- Automatically switches language based on user preference
- All strings translated in component

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

Requires: JavaScript enabled, Cookies enabled, Third-party cookies (for OAuth)

## Security Notes

🔒 **Authentication:**
- Google OAuth 2.0 handles secure authentication
- Tokens never stored in localStorage (Firebase handles securely)
- Session managed by Firebase

🔒 **Data Protection:**
- All communication over HTTPS
- API key restricted to Firebase project
- Error messages don't expose sensitive data

🔒 **Production Ready:**
- Comprehensive error handling
- User-friendly error messages
- No console logging of sensitive data in production

## Next Steps

1. ✅ **Setup Complete** - Firebase and auth functions ready
2. ✅ **Components Created** - GoogleLogin component and Navbar integration
3. **Testing** - Test auth flows thoroughly
4. **Feature Protection** - Add auth guards to medical features
5. **User Profiles** - Create extended profile pages
6. **Analytics** - Track user engagement

## Support & Documentation

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [React Firebase Integration](https://firebase.google.com/docs/web/setup)

## Created Files Summary

| File | Purpose | Status |
|------|---------|--------|
| src/services/firebase.js | Firebase initialization | ✅ Created |
| src/services/auth.js | Auth helper functions | ✅ Created |
| src/components/GoogleLogin.tsx | React login component | ✅ Created |
| src/components/Navbar.tsx | Updated with Firebase | ✅ Updated |

## Package Dependencies

- `firebase`: ^9.23.0+ (installed via npm)
- `react-i18next`: ^12.0+ (for bilingual support)
- `lucide-react`: ^0.x+ (for icons)
- Existing: React 18, TypeScript, Tailwind CSS
