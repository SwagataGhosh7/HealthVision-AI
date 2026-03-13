import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FooterSection = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border/30 bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <Activity className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-semibold text-foreground">HealthVision AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-powered healthcare diagnostics platform using deep learning for disease detection, cancer screening, and real-time vital monitoring.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Features</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">AI Disease Detection</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Cancer Screening</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Heartbeat Monitoring</a></li>
              <li><button onClick={() => navigate("/medical-tools")} className="hover:text-foreground transition-colors">Medical AI Tools</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">Terms of Service</button></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Medical Disclaimer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Connect</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="https://www.instagram.com/healthvision_india/?utm_source=ig_web_button_share_sheet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  📷 Instagram
                </a>
              </li>
              <li><a href="mailto:contact@healthvisionai.com" className="hover:text-foreground transition-colors">✉️ contact@healthvisionai.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 HealthVision AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 italic">
            ⚠️ AI-generated results are for informational purposes only. Always consult a healthcare professional.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
