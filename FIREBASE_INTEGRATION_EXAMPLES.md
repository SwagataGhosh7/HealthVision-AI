/**
 * Firebase Authentication Integration Example
 * 
 * This file shows how to integrate Firebase Google Authentication into your app
 * Three different implementation approaches are shown below.
 */

// ============================================================================
// APPROACH 1: Use GoogleLogin Component (Recommended - Simplest)
// ============================================================================

/**
 * Quick Integration - Just use the GoogleLogin component
 * 
 * Perfect for: Auth pages, login modals, quick implementation
 */

import GoogleLogin from '@/components/GoogleLogin';

export function AuthPageApproach1() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <GoogleLogin />
    </div>
  );
}

// ============================================================================
// APPROACH 2: Custom Implementation (More Control)
// ============================================================================

/**
 * Manual Implementation - For more customization
 * 
 * Perfect for: Custom UI, specific workflows, advanced requirements
 */

import React, { useState } from 'react';
import { googleSignIn, googleSignOut, onAuthStateListener } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, LogOut } from 'lucide-react';

function AuthPageApproach2() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen to auth changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateListener((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleSignIn();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleSignOut();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mb-4"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          Continue with Google
        </Button>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="text-center">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.name}
            className="h-20 w-20 rounded-full mx-auto mb-4"
          />
        )}
        <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-4">{user.name}</p>
        <p className="text-sm text-gray-500 mb-6">{user.email}</p>

        <Button
          onClick={handleLogout}
          disabled={loading}
          variant="destructive"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <LogOut className="mr-2" />}
          Sign Out
        </Button>
      </div>
    </Card>
  );
}

// ============================================================================
// APPROACH 3: Conditional Rendering (For App-Wide Auth)
// ============================================================================

/**
 * App-Wide Integration - Show different content based on auth
 * 
 * Perfect for: Full app routing, conditional features, dashboard access
 */

import { useEffect, useState } from 'react';
import { onAuthStateListener } from '@/services/auth';

function AppWithAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateListener((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Show login if not authenticated
  if (!user) {
    return <AuthPageApproach1 />;
  }

  // Show dashboard if authenticated
  return (
    <div>
      <nav className="p-4 bg-blue-600 text-white">
        <span>Welcome, {user.name}!</span>
      </nav>
      <main className="p-4">
        {/* Your app content here */}
      </main>
    </div>
  );
}

// ============================================================================
// APPROACH 4: Protected Route Wrapper (For Route Protection)
// ============================================================================

/**
 * Protected Route - Redirect to login if not authenticated
 * 
 * Perfect for: Route guards, access control, feature restrictions
 */

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateListener((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Usage in router:
// <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

// ============================================================================
// APPROACH 5: Custom Hook (For Code Reusability)
// ============================================================================

/**
 * Custom Hook - Encapsulate auth logic
 * 
 * Perfect for: Reusable components, cleaner code, state management
 */

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateListener((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleSignIn();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleSignOut();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return { user, loading, error, login, logout };
}

// Usage:
function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// ============================================================================
// SUMMARY - Which Approach to Use?
// ============================================================================

/**

QUICK INTEGRATION (5 minutes):
→ Use Approach 1 (GoogleLogin Component)
→ Just drop it in and it works
→ Handles everything for you

CUSTOM UI (15 minutes):
→ Use Approach 2 (Manual Implementation)
→ More control over styling
→ Custom error messages

APP-WIDE INTEGRATION (30 minutes):
→ Use Approach 3 (Conditional Rendering)
→ Show different pages based on auth
→ Clean app structure

FOR ROUTE PROTECTION (20 minutes):
→ Use Approach 4 (Protected Route)
→ Guard sensitive features
→ Automatic redirects

FOR REUSABLE CODE (Advanced):
→ Use Approach 5 (Custom Hook)
→ Share auth logic across components
→ Cleaner component code

*/

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

/**

✅ Step 1: Install Firebase (Already done)
   npm install firebase

✅ Step 2: Configure Firebase (Already done)
   Create src/services/firebase.js

✅ Step 3: Create Auth Functions (Already done)
   Create src/services/auth.js

✅ Step 4: Create GoogleLogin Component (Already done)
   Create src/components/GoogleLogin.tsx

✅ Step 5: Update Navbar (Already done)
   Integrate user profile dropdown

✅ Step 6: Choose Integration Approach
   Pick one of the 5 approaches above

✅ Step 7: Add to Auth Page
   Use GoogleLogin component or custom implementation

✅ Step 8: Test Locally
   npm run dev → http://localhost:5173

✅ Step 9: Deploy to Production
   Add domain to Firebase Console

*/

export {
  AuthPageApproach1,
  AuthPageApproach2,
  AppWithAuth,
  ProtectedRoute,
  useAuth,
};
