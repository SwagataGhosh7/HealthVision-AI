import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  tags: string[];
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, image, tags, index }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative rounded-xl border border-border/50 bg-gradient-card overflow-hidden hover:border-primary/30 transition-all duration-500"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
      </div>

      <div className="relative p-6 -mt-16 z-10">
        <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:glow transition-shadow duration-500">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-secondary/80 text-secondary-foreground border border-border/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
