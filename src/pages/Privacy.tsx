import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-9 w-9 rounded-lg bg-gradient-accent flex items-center justify-center glow">
              <Activity className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">HealthVision <span className="text-gradient">AI</span></span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1 as any)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-4 text-sm leading-relaxed">
          <p><strong className="text-foreground">Last updated:</strong> March 13, 2026</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">1. Information We Collect</h2>
          <p>We collect personal information you provide during registration (name, email), medical data you upload for analysis (X-rays, reports, vital signs), and usage data to improve our services.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">2. How We Use Your Data</h2>
          <p>Your medical data is processed solely for AI-powered diagnostic analysis. We do not sell or share your personal health information with third parties. All analyses are performed using encrypted, HIPAA-aligned processes.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">3. Data Security</h2>
          <p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Medical uploads are stored in secure, access-controlled cloud storage with row-level security policies ensuring only you can access your data.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">4. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at contact@healthvisionai.com.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">5. AI Disclaimer</h2>
          <p>AI-generated diagnoses are for informational purposes only and should not replace professional medical advice. Always consult a qualified healthcare provider for medical decisions.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
