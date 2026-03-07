import { motion } from "framer-motion";
import { ArrowRight, Brain, Shield, Zap } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-medical.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero pt-16">
      {/* Background image overlay */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="AI Medical Diagnostics Interface" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 mb-8">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-secondary-foreground">Make Healthcare Great Again</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
          >
            Precision Medicine
            <br />
            Powered by{" "}
            <span className="text-gradient">Deep Learning</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Advanced AI algorithms analyze medical images, detect diseases early, and monitor vital signs in real-time — empowering healthcare professionals with unprecedented diagnostic accuracy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="bg-gradient-accent text-accent-foreground glow hover:opacity-90 transition-opacity text-base px-8" onClick={() => window.location.href = '/auth'}>
              Start Diagnosis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 text-foreground hover:bg-secondary/50 text-base px-8" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              View Research
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
          >
            {[
              { icon: Brain, label: "Accuracy Rate", value: "98.7%" },
              { icon: Zap, label: "Analysis Speed", value: "<2s" },
              { icon: Shield, label: "Conditions Detected", value: "150+" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
