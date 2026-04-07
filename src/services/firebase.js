/**
 * Firebase Configuration
 * Initialize Firebase with HealthVision AI credentials
 * 
 * Features:
 * - Firebase App initialization
 * - Modular SDK (v9+)
 * - Production-ready configuration
 * - Works with Google Authentication
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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
