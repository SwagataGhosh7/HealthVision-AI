import { Activity } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="border-t border-border/30 bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center">
              <Activity className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-foreground">HealthVision AI</span>
          </div>

          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Research</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 HealthVision AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
