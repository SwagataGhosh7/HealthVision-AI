import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Invalid or expired reset link.");
      navigate("/auth");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-accent flex items-center justify-center glow">
              <Activity className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              HealthVision <span className="text-gradient">AI</span>
            </span>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">Password Updated!</h2>
              <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground mb-2 text-center">Set New Password</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Enter your new password below</p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-foreground text-sm">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 pr-10 bg-secondary/30 border-border/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground text-sm">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-secondary/30 border-border/60"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-accent text-accent-foreground glow hover:opacity-90"
                >
                  {loading ? "Updating..." : "Update Password"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
