# Firebase Authentication - Quick Reference & Examples

## Quick Start (30 seconds)

### 1. Import GoogleLogin Component
```tsx
import GoogleLogin from '@/components/GoogleLogin';
```

### 2. Use in Your Page
```tsx
export default function LoginPage() {
  return <GoogleLogin />;
}
```

That's it! The component handles:
- ✅ Login with Google
- ✅ User profile display
- ✅ Logout functionality
- ✅ Error handling
- ✅ Loading states
- ✅ Bilingual support

---

## Code Examples

### Example 1: Use Auth in a Component

```tsx
import { useEffect, useState } from 'react';
import { onAuthStateListener, googleSignIn, googleSignOut } from '@/services/auth';

function MyComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth changes
    const unsubscribe = onAuthStateListener((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.name}!</h1>
          <img src={user.photoURL} alt={user.name} />
          <p>Email: {user.email}</p>
          <button onClick={googleSignOut}>Logout</button>
        </div>
      ) : (
        <button onClick={googleSignIn}>Login with Google</button>
      )}
    </div>
  );
}
```

### Example 2: Protect Routes Behind Authentication

```tsx
import { useEffect, useState } from 'react';
import { onAuthStateListener } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateListener((currentUser) => {
      setLoading(false);
      if (!currentUser) {
        navigate('/auth');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return user ? children : null;
}

// Usage:
<ProtectedRoute>
  <MedicalAnalysis />
</ProtectedRoute>
```

### Example 3: Show User Menu Dropdown

```tsx
import { useState, useEffect } from 'react';
import { onAuthStateListener, googleSignOut } from '@/services/auth';
import { LogOut } from 'lucide-react';

function UserMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateListener(setUser);
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.name}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span>{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 bg-white rounded-lg shadow-lg">
          <p className="px-4 py-2">{user.email}</p>
          <button
            onClick={async () => {
              await googleSignOut();
              setOpen(false);
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Get Current User Info

```tsx
import { getCurrentUser, isAuthenticated } from '@/services/auth';

// Check if user is logged in
if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('User:', user.email);
}

// Get user data anytime
function showUserInfo() {
  const user = getCurrentUser();
  if (user) {
    alert(`Logged in as: ${user.name}`);
  } else {
    alert('Not logged in');
  }
}
```

### Example 5: Handle Login with Error Display

```tsx
import { useState } from 'react';
import { googleSignIn } from '@/services/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

function LoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await googleSignIn();
      console.log('Success! User:', user);
      // Navigate to dashboard or home
    } catch (err) {
      setError(err.message);
      // Show error toast/alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="inline mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          'Login with Google'
        )}
      </button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### Example 6: Show Different Content Based on Auth

```tsx
import { useState, useEffect } from 'react';
import { onAuthStateListener } from '@/services/auth';
import GoogleLogin from '@/components/GoogleLogin';
import Dashboard from './Dashboard';

function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateListener(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <GoogleLogin />
      )}
    </div>
  );
}
```

---

## API Reference

### Auth Functions

#### `googleSignIn()`
Signs in user with Google popup.

```typescript
const user = await googleSignIn();
// Error if popup blocked or cancelled
```

**Returns:** User object
**Throws:** Error with user-friendly message

---

#### `googleSignOut()`
Signs out current user.

```typescript
await googleSignOut();
```

**Returns:** void
**Throws:** Error if logout fails

---

#### `onAuthStateListener(callback)`
Listens to auth state changes in real-time.

```typescript
const unsubscribe = onAuthStateListener((user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// Stop listening
unsubscribe();
```

**Returns:** Unsubscribe function
**Callback Param:** User object or null

---

#### `getCurrentUser()`
Gets currently logged-in user synchronously.

```typescript
const user = getCurrentUser();
if (user) {
  console.log('UID:', user.uid);
}
```

**Returns:** User object or null

---

#### `isAuthenticated()`
Checks if user is logged in.

```typescript
if (isAuthenticated()) {
  console.log('User is logged in');
}
```

**Returns:** boolean

---

#### `getAuthInstance()`
Gets Firebase Auth instance for advanced operations.

```typescript
const auth = getAuthInstance();
// Use with Firebase Admin SDK or custom implementations
```

**Returns:** Firebase Auth instance

---

## User Object Structure

```typescript
interface User {
  uid: string;              // Unique identifier
  email: string;            // User email address
  name: string;             // Display name
  photoURL: string;         // Profile picture URL
  emailVerified: boolean;   // Is email verified
  createdAt: Date;          // Account creation time
  lastSignInTime: Date;     // Last login time
  token: string;            // JWT access token
}
```

---

## Bilingual Support

The GoogleLogin component automatically detects language from your app's i18n configuration.

**Supported Languages:**
- ✅ English (en)
- ✅ Bengali (bn)

**How it works:**
```tsx
// Component automatically uses current language
// Set language via i18n:
i18n.changeLanguage('bn'); // Switch to Bengali
i18n.changeLanguage('en'); // Switch to English
```

---

## Integrating with Medical Features

### Example: Protect SymptomsChecker

```tsx
// src/pages/MedicalTools.tsx

import ProtectedRoute from '@/components/ProtectedRoute';
import SymptomsChecker from '@/components/SymptomsChecker';

export default function MedicalTools() {
  return (
    <ProtectedRoute>
      <SymptomsChecker />
    </ProtectedRoute>
  );
}
```

### Example: Show Feature Based on Login

```tsx
import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/services/auth';
import { Lock } from 'lucide-react';

function FeatureCard() {
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    setCanAccess(isAuthenticated());
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3>AI Medical Analysis</h3>
      <p>Advanced symptom analysis powered by AI</p>
      
      <button
        disabled={!canAccess}
        className={canAccess ? 'bg-blue-600' : 'bg-gray-400'}
      >
        {canAccess ? 'Access Feature' : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Sign in to use
          </>
        )}
      </button>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Auth with Context Hook

```tsx
// Create custom hook
import { createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateListener(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthUser() {
  return useContext(AuthContext);
}

// Use in components
function MyComponent() {
  const user = useAuthUser();
  return <div>{user?.name}</div>;
}
```

### Pattern 2: Auth with Redux

```typescript
// store/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

// In component
useEffect(() => {
  const unsubscribe = onAuthStateListener((user) => {
    dispatch(setUser(user));
  });
  return () => unsubscribe();
}, [dispatch]);
```

### Pattern 3: Auth in Custom Hook

```tsx
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateListener((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

// Usage
function MyComponent() {
  const { user, loading } = useAuth();
  // ...
}
```

---

## Testing in Development

### Test Locally

```bash
npm run dev
```

1. Open http://localhost:5173
2. Click "Get Started" or "Sign In"
3. Click "Continue with Google"
4. Select Google account
5. Verify profile displays

### Test Different Scenarios

**Scenario 1: Popup Blocked**
- Look for error message: "Popup was blocked"
- Check browser popup settings

**Scenario 2: Domain Not Authorized**
- Error: "This domain is not authorized"
- Add `localhost` to Firebase Console

**Scenario 3: Session Persistence**
- Login, refresh page
- User should remain logged in
- Check DevTools → Application → Cookies

---

## Deployment Checklist

- [ ] Firebase config updated for production domain
- [ ] Domain added to Firebase Console authorized list
- [ ] Google OAuth consent screen configured
- [ ] Test with real Google account
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring in place (e.g., Sentry)
- [ ] User data privacy policy displayed
- [ ] GDPR compliance confirmed

---

## Troubleshooting

### "Firebase is not defined"
```
npm install firebase --save
```

### "auth is not defined"
```
// Check import in your component
import { googleSignIn } from '@/services/auth';
```

### "Cannot read property 'currentUser'"
```
// Wait for auth to initialize
useEffect(() => {
  const unsubscribe = onAuthStateListener(setUser);
  return () => unsubscribe();
}, []);
```

### "User still exists after logout"
```
// Ensure logout is called
await googleSignOut();
// Then manually clear local state
setUser(null);
```

---

## Performance Tips

1. **Use `onAuthStateListener` for real-time updates** (recommended)
2. **Cache user object to avoid repeated calls**
3. **Use route protection with code splitting**
4. **Consider lazy loading auth components**

---

## Security Notes

🔒 Never store tokens in localStorage
🔒 Use HTTPS in production
🔒 Validate user on backend before sharing medical data
🔒 Implement rate limiting on sensitive endpoints

---

## Next Steps

1. Add auth to more pages
2. Create user profile customization
3. Add role-based access (doctor vs patient)
4. Implement profile picture upload
5. Add email verification flow

---

## Support

For issues:
1. Check browser console for errors
2. Open DevTools → Network tab to see requests
3. Check Firebase Console logs
4. Review application data in DevTools

**Error codes:**
- `auth/popup-blocked` - Browser popup blocked
- `auth/popup-closed-by-user` - User closed popup
- `auth/unauthorized-domain` - Domain not authorized
- `auth/network-request-failed` - Network error
