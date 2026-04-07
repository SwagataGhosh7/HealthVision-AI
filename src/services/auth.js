/**
 * Firebase Google Authentication Service
 * HealthVision AI - Complete Implementation
 * 
 * ✅ Works on localhost with signInWithPopup
 * ✅ Works on Firebase Hosting with signInWithRedirect
 * ✅ Handles redirect result on page load
 * ✅ Production-ready error handling
 * ✅ Firebase v9+ modular syntax
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth, isProduction, isDevelopment } from "./firebase";

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Configure Google provider for better UX
googleProvider.setCustomParameters({
  prompt: "select_account", // Force account selection
  hl: "en"
});

// Add required scopes for profile access
googleProvider.addScope("profile");
googleProvider.addScope("email");

/**
 * Login with Google - Adaptive method based on environment
 * 
 * localhost → signInWithPopup (no page redirect)
 * Production → signInWithRedirect (handles refresh properly)
 * 
 * @returns {Promise<Object>} User data or null
 */
export const loginWithGoogle = async () => {
  try {
    let result;

    if (isDevelopment) {
      // 🔵 Development: Use popup (faster, no page reload)
      console.log("📍 Using popup method (development)");
      result = await signInWithPopup(auth, googleProvider);
    } else {
      // 🟢 Production: Use redirect (works better on Firebase Hosting)
      console.log("📍 Using redirect method (production)");
      await signInWithRedirect(auth, googleProvider);
      return null; // Redirect will reload page
    }

    // Extract user data
    return extractUserData(result.user);
  } catch (error) {
    const friendlyError = handleAuthError(error);
    console.error("❌ Login failed:", friendlyError);
    throw new Error(friendlyError);
  }
};

/**
 * Handle redirect result - MUST be called on app mount
 * This is critical for production (Firebase Hosting)
 * 
 * @returns {Promise<Object>} User data if redirect occurred
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);

    if (result) {
      console.log("✅ Redirect result found - User logged in");
      return extractUserData(result.user);
    }
  } catch (error) {
    const friendlyError = handleAuthError(error);
    console.error("❌ Redirect handling failed:", friendlyError);
    throw new Error(friendlyError);
  }
};

/**
 * Extract user information from Firebase user object
 * 
 * @param {Object} firebaseUser - Firebase user object
 * @returns {Object} Formatted user data
 */
export const extractUserData = (firebaseUser) => {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || "User",
    email: firebaseUser.email,
    photo: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: firebaseUser.metadata?.creationTime,
    lastSignInTime: firebaseUser.metadata?.lastSignInTime,
    isAnonymous: firebaseUser.isAnonymous,
    provider: firebaseUser.providerData?.[0]?.providerId || "unknown"
  };
};

/**
 * Logout user
 * 
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("✅ Logged out successfully");
  } catch (error) {
    console.error("❌ Logout failed:", error);
    throw new Error("Failed to logout. Please try again.");
  }
};

/**
 * Monitor authentication state changes in real-time
 * 
 * @param {Function} callback - Called with user object whenever auth state changes
 * @returns {Function} Unsubscribe function
 */
export const trackAuthState = (callback) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      console.log("✅ User logged in:", firebaseUser.email);
      callback(extractUserData(firebaseUser));
    } else {
      console.log("❌ User logged out");
      callback(null);
    }
  });
};

/**
 * Get current user synchronously
 * 
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? extractUserData(firebaseUser) : null;
};

/**
 * Check if user is logged in
 * 
 * @returns {Boolean}
 */
export const isLoggedIn = () => {
  return auth.currentUser !== null;
};

/**
 * Get current user's ID token for API calls
 * 
 * @returns {Promise<String>} ID token
 */
export const getIdToken = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("No user logged in");
    }
    return await auth.currentUser.getIdToken(true);
  } catch (error) {
    console.error("❌ Failed to get ID token:", error);
    throw error;
  }
};

/**
 * Handle Firebase authentication errors with user-friendly messages
 * 
 * @param {Object} error - Firebase error object
 * @returns {String} User-friendly error message
 */
const handleAuthError = (error) => {
  console.error("Firebase Error Code:", error.code);

  const errorMessages = {
    "auth/popup-blocked": "🚫 Popup was blocked. Please allow popups in your browser settings.",
    "auth/popup-closed-by-user": "❌ Sign-in was cancelled.",
    "auth/unauthorized-domain": "🔒 This domain is not authorized. Add it to Firebase Console.",
    "auth/network-request-failed": "📡 Network error. Please check your internet connection.",
    "auth/cancelled-popup-request": "⏸️ Multiple popups detected. Please wait.",
    "auth/operation-not-supported-in-this-environment": "⚠️ This browser doesn't support popups. Try another browser.",
    "auth/operation-not-allowed": "🔐 Google Sign-In is not enabled. Contact admin.",
    "auth/requires-recent-login": "🔄 Please log in again to continue.",
    "auth/user-disabled": "🚫 This account has been disabled.",
    "auth/user-not-found": "👤 User not found.",
    "auth/invalid-credential": "🔑 Invalid credentials.",
    "auth/invalid-email": "📧 Invalid email address.",
    "auth/weak-password": "🔐 Password is too weak.",
    "auth/email-already-in-use": "📧 Email is already in use.",
    "auth/account-exists-with-different-credential": "⚠️ Account exists with different login method."
  };

  return errorMessages[error.code] || `Error: ${error.message || "Unknown error occurred"}`;
};

/**
 * Configure session persistence (localStorage vs sessionStorage)
 * 
 * @param {String} type - "local" or "session"
 */
export const setPersistenceMode = async (type = "local") => {
  try {
    const persistence = type === "local" 
      ? browserLocalPersistence 
      : browserSessionPersistence;
    
    await setPersistence(auth, persistence);
    console.log(`✅ Persistence set to: ${type}`);
  } catch (error) {
    console.error("❌ Failed to set persistence:", error);
  }
};
