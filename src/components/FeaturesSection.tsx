import { motion } from "framer-motion";
import { Scan, Microscope, HeartPulse } from "lucide-react";
import FeatureCard from "./FeatureCard";
import xrayScan from "@/assets/xray-scan.jpg";
import cancerScreening from "@/assets/cancer-screening.jpg";
import heartMonitor from "@/assets/heart-monitor.jpg";

const features = [
  {
    icon: Scan,
    title: "Disease Detection",
    description:
      "Deep learning models analyze X-rays, MRI scans, and CT scans to detect pneumonia, tuberculosis, and other conditions with radiologist-level accuracy.",
    image: xrayScan,
    tags: ["X-Ray", "MRI", "CT Scan", "Deep Learning"],
  },
  {
    icon: Microscope,
    title: "Cancer Screening",
    description:
      "AI-driven analysis of blood reports and medical images enables early detection of cancers, improving survival rates through timely intervention.",
    image: cancerScreening,
    tags: ["Early Detection", "Pathology", "Blood Analysis"],
  },
  {
    icon: HeartPulse,
    title: "Heartbeat Monitoring",
    description:
      "Real-time AI analysis of heart rate data from smartwatches and wearables classifies conditions as hypertension, hypotension, or normal rhythm.",
    image: heartMonitor,
    tags: ["Wearables", "ECG", "Real-time"],
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-primary mb-3 block">
            Core Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            AI-Powered <span className="text-gradient">Diagnostics</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three breakthrough applications transforming how healthcare professionals detect, diagnose, and monitor medical conditions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
