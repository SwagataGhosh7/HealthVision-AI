import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-4 text-sm leading-relaxed">
          <p><strong className="text-foreground">Last updated:</strong> March 13, 2026</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">1. Acceptance of Terms</h2>
          <p>By accessing HealthVision AI, you agree to these Terms of Service. If you do not agree, please do not use our platform.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">2. Service Description</h2>
          <p>HealthVision AI provides AI-powered medical image analysis, symptom checking, medication information, vital signs tracking, and nearby medical service locator. These tools are designed to assist, not replace, professional medical judgment.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">3. Medical Disclaimer</h2>
          <p>HealthVision AI is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition. Never disregard professional medical advice because of AI-generated results.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">4. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account. You agree to provide accurate information and not misuse the platform.</p>
          <h2 className="text-foreground text-lg font-semibold mt-6">5. Limitation of Liability</h2>
          <p>HealthVision AI shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of AI-generated medical analyses or recommendations.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
