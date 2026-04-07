/**
 * Firebase Configuration & Initialization
 * HealthVision AI - Complete Authentication System
 * 
 * Features:
 * ✅ Firebase v9+ modular syntax
 * ✅ Production-ready configuration
 * ✅ Works on localhost and Firebase Hosting
 * ✅ Google OAuth 2.0 support
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8snLc2zoxPlRxp8JiAJHqyI65UTiXEj4",
  authDomain: "healthvision-ai-e647d.firebaseapp.com",
  projectId: "healthvision-ai-e647d",
  storageBucket: "healthvision-ai-e647d.firebasestorage.app",
  messagingSenderId: "987939443366",
  appId: "1:987939443366:web:ce9bb020cb2ab6ae821a67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication instance
export const auth = getAuth(app);

// Detect environment
export const isProduction = !window.location.hostname.includes("localhost");
export const isDevelopment = window.location.hostname.includes("localhost");

console.log(`🌍 Environment: ${isDevelopment ? "Development (localhost)" : "Production (Firebase Hosting)"}`);

export default app;
