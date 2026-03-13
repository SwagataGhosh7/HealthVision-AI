import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const healthTips = [
  {
    tip: "Regular health checkups can detect potential issues before they become serious. Schedule annual screenings for blood pressure, cholesterol, and diabetes.",
    category: "Prevention",
  },
  {
    tip: "Staying hydrated improves brain function, energy levels, and helps flush toxins. Aim for 8 glasses of water daily.",
    category: "Wellness",
  },
  {
    tip: "Walking just 30 minutes a day reduces heart disease risk by 35% and improves mental health significantly.",
    category: "Fitness",
  },
  {
    tip: "Quality sleep of 7-9 hours strengthens immunity, improves memory, and reduces inflammation throughout the body.",
    category: "Sleep",
  },
  {
    tip: "Consuming a diet rich in fruits, vegetables, and omega-3 fatty acids can reduce the risk of chronic diseases by up to 50%.",
    category: "Nutrition",
  },
];

const testimonials = [
  {
    quote: "HealthVision AI detected an early-stage condition that my doctor confirmed. The AI analysis was remarkably accurate.",
    author: "Dr. Priya Sharma",
    role: "Cardiologist, AIIMS Delhi",
  },
  {
    quote: "The symptom checker helped me understand my condition before visiting the doctor, saving valuable consultation time.",
    author: "Rahul Verma",
    role: "Patient, Mumbai",
  },
  {
    quote: "As a rural healthcare worker, the nearby services feature helps me quickly locate facilities for my patients.",
    author: "Anita Devi",
    role: "ASHA Worker, Bihar",
  },
];

const HealthTipsSection = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Daily Health Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-primary mb-3 block">
            Daily Wellness
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Health <span className="text-gradient">Tips</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto mb-20">
          <div className="relative bg-card border border-border/60 rounded-2xl p-8 md:p-12">
            <Lightbulb className="h-8 w-8 text-primary mb-4" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {healthTips[currentTip].category}
                </span>
                <p className="text-foreground text-lg md:text-xl leading-relaxed mt-2">
                  {healthTips[currentTip].tip}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-1.5">
                {healthTips.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTip(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentTip ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentTip((prev) => (prev - 1 + healthTips.length) % healthTips.length)}
                  className="h-8 w-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentTip((prev) => (prev + 1) % healthTips.length)}
                  className="h-8 w-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-primary mb-3 block">
            Trusted by Professionals
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            What People <span className="text-gradient">Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <Quote className="h-5 w-5 text-primary/40 mb-3" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "{t.quote}"
              </p>
              <div>
                <p className="text-foreground text-sm font-medium">{t.author}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthTipsSection;
