import { motion } from "framer-motion";
import { TrendingUp, Users, Database, Award } from "lucide-react";

const stats = [
  { icon: TrendingUp, value: "2.4M+", label: "Scans Analyzed" },
  { icon: Users, value: "12K+", label: "Healthcare Providers" },
  { icon: Database, value: "50TB+", label: "Training Data" },
  { icon: Award, value: "99.2%", label: "Specificity Rate" },
];

const StatsSection = () => {
  return (
    <section id="stats" className="py-20 border-y border-border/30 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <Icon className="h-6 w-6 text-primary mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
