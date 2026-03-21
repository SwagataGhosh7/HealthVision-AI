import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("Auth callback triggered");
      console.log("Current URL:", window.location.href);
      console.log("Hash fragment:", window.location.hash);
      
      try {
        // Get the URL hash fragment which contains the access tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        console.log("Tokens found:", { accessToken: !!accessToken, refreshToken: !!refreshToken });
        console.log("Error in URL:", { error, errorDescription });
        
        if (error) {
          throw new Error(errorDescription || error);
        }
        
        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) throw sessionError;
          toast.success("Email verified successfully!");
          navigate("/dashboard");
        } else {
          // Fallback: check if there's already a session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          
          if (session) {
            toast.success("Already logged in!");
            navigate("/dashboard");
          } else {
            toast.error("No valid session found - please check your email verification link");
            navigate("/auth");
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast.error(error.message || "Email verification failed");
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Verifying your email...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
