/**
 * Firebase Authentication Helpers
 * Simplified approach using Firebase v9+ modular syntax
 * 
 * Features:
 * - Google Sign-In with popup
 * - User state tracking
 * - Logout functionality
 * - Error handling
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { auth } from "./firebase";

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

/**
 * 🔑 Login with Google - Popup authentication
 * 
 * @returns {Promise<Object>} User data with name, email, photo
 * @throws {Error} If login fails
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("✅ Login successful!");
    console.log("Name:", user.displayName);
    console.log("Email:", user.email);
    console.log("Photo:", user.photoURL);

    return {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      emailVerified: user.emailVerified
    };

  } catch (error) {
    console.error("❌ Login failed:", error.message);
    throw new Error(error.message);
  }
};

/**
 * 🔄 Track user authentication state in real-time
 * 
 * @param {Function} callback - Called with user object when state changes
 * @returns {Function} Unsubscribe function to stop listening
 */
export const trackAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ User logged in:", user.email);
      callback({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        emailVerified: user.emailVerified
      });
    } else {
      console.log("❌ User logged out");
      callback(null);
    }
  });
};

/**
 * 🚪 Logout function
 * 
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("✅ Logged out successfully");
  } catch (error) {
    console.error("❌ Logout failed:", error.message);
    throw new Error(error.message);
  }
};

/**
 * Get current user synchronously
 * 
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      emailVerified: user.emailVerified
    };
  }
  return null;
};

/**
 * Check if user is logged in
 * 
 * @returns {Boolean}
 */
export const isLoggedIn = () => {
  return auth.currentUser !== null;
};
