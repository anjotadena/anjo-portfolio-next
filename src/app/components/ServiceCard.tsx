import React from "react";
import { motion } from "motion/react";
import { Code, Brain, Network, Zap, Users, Server, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  brain: Brain,
  network: Network,
  zap: Zap,
  users: Users,
  server: Server,
};

interface ServiceCardProps {
  title: string;
  description: string;
  outcome: string;
  icon: string;
  index: number;
}

export function ServiceCard({ title, description, outcome, icon, index }: ServiceCardProps) {
  const Icon = iconMap[icon] || Code;

  return (
    <motion.div
      className="bg-card backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(99, 102, 241, 0.15)",
      }}
    >
      <div className="space-y-4">
        <motion.div
          className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"
          whileHover={{ rotate: 5, scale: 1.1 }}
        >
          <Icon className="text-primary" size={24} />
        </motion.div>

        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-primary/80 font-medium">Outcome</p>
          <p className="text-sm text-muted-foreground mt-1">{outcome}</p>
        </div>
      </div>
    </motion.div>
  );
}