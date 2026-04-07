import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import { handleRedirectResult } from "@/services/auth";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("🔄 Firebase Auth Callback triggered");
      console.log("Current URL:", window.location.href);
      
      try {
        // Step 1: Handle Firebase redirect result (critical for OAuth flow)
        console.log("📍 Checking for redirect result...");
        const redirectUser = await handleRedirectResult();
        
        // Step 2: Wait for Firebase auth state to settle
        console.log("⏳ Waiting for auth state...");
        const authStatePromise = new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            console.log("✅ Auth state settled. User:", user?.email || "none");
            resolve(user);
          });
        });

        const user = await authStatePromise;

        if (user) {
          console.log("✅ User authenticated successfully:", user.email);
          toast.success("🎉 Logged in successfully!");
          // Redirect to dashboard after a brief delay to show the toast
          setTimeout(() => navigate("/dashboard", { replace: true }), 500);
          return;
        }

        // Step 3: If no user, redirect back to auth page
        console.log("❌ No authenticated user found, redirecting to /auth");
        navigate("/auth", { replace: true });

      } catch (error: any) {
        console.error("❌ Auth callback error:", error);
        
        // Don't show error if it's just "no redirect result" (normal case)
        if (error.message && !error.message.includes("no redirect")) {
          toast.error(error.message || "Authentication failed");
        }
        
        // Redirect back to auth page after a brief delay
        setTimeout(() => navigate("/auth", { replace: true }), 1000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Processing your login...</p>
          <p className="text-sm text-gray-600 mt-1">Redirecting to your dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
