import { motion } from "framer-motion";
import { Activity, Menu, X, Sun, Moon, LogOut, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { trackAuthState, logout } from "@/services/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Monitor Firebase authentication state
  useEffect(() => {
    const unsubscribe = trackAuthState((currentUser) => {
      setFirebaseUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isAuthenticated = user || firebaseUser;

  const handleLogout = async () => {
    try {
      await logout();
      setFirebaseUser(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-9 w-9 rounded-lg bg-gradient-accent flex items-center justify-center glow">
            <Activity className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            HealthVision <span className="text-gradient">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Diagnostics</a>
          <a
            href="https://www.instagram.com/healthvision_india/?utm_source=ig_web_button_share_sheet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3 relative">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors"
              >
                {firebaseUser?.photo ? (
                  <img
                    src={firebaseUser.photo}
                    alt={firebaseUser.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center">
                    <span className="text-xs text-accent-foreground font-semibold">
                      {firebaseUser?.name?.charAt(0) || user?.email?.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-foreground hidden lg:block">
                  {firebaseUser?.name || user?.email?.split("@")[0]}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-background border border-border/50 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4 border-b border-border/30">
                    <p className="text-sm font-semibold text-foreground">
                      {firebaseUser?.name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {firebaseUser?.email || user?.email}
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-gradient-accent text-accent-foreground glow hover:opacity-90 transition-opacity"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <a href="#features" className="text-sm text-muted-foreground py-2">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground py-2">Diagnostics</a>
            <a href="https://www.instagram.com/healthvision_india/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground py-2">Contact</a>
            <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
            {isAuthenticated ? (
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {firebaseUser?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {firebaseUser?.email || user?.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-accent text-accent-foreground"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                >
                  Profile Settings
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button size="sm" className="bg-gradient-accent text-accent-foreground mt-2" onClick={() => {navigate("/auth"); setIsOpen(false);}}>Get Started</Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
