/**
 * Google Login Component
 * 
 * Features:
 * - "Continue with Google" button (adaptive: popup on localhost, redirect on production)
 * - Shows user profile after login
 * - Logout functionality
 * - Loading states
 * - Error handling
 * - Mobile-friendly design
 * - Bilingual support (English + Bengali)
 * - Handles OAuth redirect results (production Firebase Hosting)
 * 
 * Usage:
 * <GoogleLogin />
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, LogIn, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginWithGoogle, logout, trackAuthState, handleRedirectResult } from '@/services/auth';

const GoogleLogin = () => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  const currentLanguage = i18n.language;

  // Get localized strings
  const getLocalizedText = (en, bn) => {
    return currentLanguage === 'bn' ? bn : en;
  };

  // Handle OAuth redirect result (production Firebase Hosting)
  // This is CRITICAL for handling the OAuth redirect flow after Google login
  useEffect(() => {
    const checkRedirectResult = async () => {
      setIsHandlingRedirect(true);
      setError(null);
      
      try {
        const redirectUser = await handleRedirectResult();
        if (redirectUser) {
          console.log('User logged in via redirect:', redirectUser);
          setUser(redirectUser);
          setSuccessMessage(getLocalizedText(
            'Successfully logged in!',
            'সফলভাবে লগ ইন করেছেন!'
          ));
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err) {
        console.error('Redirect result error:', err);
        // Only show error if it's not just "no redirect" (which is normal)
        if (err.code !== 'auth/no-redirect-result') {
          setError(err.message);
        }
      } finally {
        setIsHandlingRedirect(false);
      }
    };

    checkRedirectResult();
  }, [currentLanguage]);

  // Monitor authentication state on component mount
  useEffect(() => {
    const unsubscribe = trackAuthState((currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
      setError(null);
      console.log('Auth state changed:', currentUser);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const loggedInUser = await loginWithGoogle();
      if (loggedInUser) {
        setUser(loggedInUser);
        setSuccessMessage(getLocalizedText(
          'Successfully logged in!',
          'সফলভাবে লগ ইন করেছেন!'
        ));
        console.log('Login successful:', loggedInUser);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || getLocalizedText(
        'Login failed. Please try again.',
        'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
      ));
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await logout();
      setUser(null);
      setSuccessMessage(getLocalizedText(
        'Signed out successfully!',
        'সফলভাবে সাইন আউট করেছেন!'
      ));
      console.log('Logout successful');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err.message || getLocalizedText(
        'Logout failed. Please try again.',
        'লগ-আউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
      ));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth and redirect
  if (!authInitialized || isHandlingRedirect) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600 text-sm">
          {getLocalizedText(
            'Loading...',
            'লোড হচ্ছে...'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      {/* Not Logged In - Login Button */}
      {!user ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {getLocalizedText(
                'Welcome to HealthVision AI',
                'HealthVision AI তে স্বাগতম'
              )}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {getLocalizedText(
                'Sign in to access your health data',
                'আপনার স্বাস্থ্য ডেটা অ্যাক্সেস করতে সাইন ইন করুন'
              )}
            </p>
          </div>

          {/* Login Card */}
          <Card className="p-6 sm:p-8 border-2">
            <div className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <AlertDescription className="text-green-800 text-sm">{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Google Login Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {getLocalizedText('Signing in...', 'সাইন ইন করা হচ্ছে...')}
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <image
                        href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'%3E%3C/svg%3E"
                      />
                    </svg>
                    {getLocalizedText(
                      'Continue with Google',
                      'Google দিয়ে চালিয়ে যান'
                    )}
                  </>
                )}
              </Button>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="bg-red-50">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  {getLocalizedText(
                    '🔒 Your data is secure. We use Firebase authentication.',
                    '🔒 আপনার ডেটা সুরক্ষিত। আমরা Firebase প্রমাণীকরণ ব্যবহার করি।'
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Logged In - Profile Display */
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {getLocalizedText(
                'Welcome back!',
                'আপনাকে স্বাগতম ফিরিয়ে!'
              )}
            </h2>
          </div>

          {/* Profile Card */}
          <Card className="p-6 sm:p-8 border-2">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Profile Picture */}
              {user.photo && (
                <img
                  src={user.photo}
                  alt={user.name || 'User'}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-blue-200"
                />
              )}

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {user.name}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {user.email}
                </p>
                {user.emailVerified && (
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    ✓ {getLocalizedText('Email verified', 'ইমেল যাচাই করা হয়েছে')}
                  </p>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-6 flex flex-col gap-3">
              {/* Success Message */}
              {successMessage && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <AlertDescription className="text-green-800 text-sm">{successMessage}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleLogout}
                disabled={loading}
                className="w-full h-10 sm:h-12 text-sm sm:text-base bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {getLocalizedText('Signing out...', 'সাইন আউট করা হচ্ছে...')}
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    {getLocalizedText('Sign Out', 'সাইন আউট')}
                  </>
                )}
              </Button>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="bg-red-50">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* User Info Details */}
          <Card className="p-4 sm:p-6 bg-gray-50">
            <h4 className="font-semibold mb-3 text-sm sm:text-base">
              {getLocalizedText('Account Information', 'অ্যাকাউন্ট তথ্য')}
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">UID:</span>
                <span className="font-mono text-gray-900 break-all">{user.uid.substring(0, 20)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {getLocalizedText('Email Status', 'ইমেল স্ট্যাটাস')}:
                </span>
                <span className={user.emailVerified ? 'text-green-600' : 'text-orange-600'}>
                  {user.emailVerified
                    ? getLocalizedText('Verified', 'যাচাই করা')
                    : getLocalizedText('Not Verified', 'যাচাই করা নয়')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GoogleLogin;
