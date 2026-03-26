import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  tech: string[];
  metrics?: {
    [key: string]: string;
  };
  index: number;
}

export function ProjectCard({ id, title, description, tech, metrics, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/projects/${id}`}>
        <motion.div
          className="group relative bg-card backdrop-blur-sm border border-border rounded-xl p-6 h-full hover:border-primary/50 transition-all duration-300"
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.2)" }}
        >
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>

            {metrics && (
              <div className="flex flex-wrap gap-4 pt-2">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-primary font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 pt-2">
              {tech.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 bg-muted border border-border rounded-md text-muted-foreground"
                >
                  {t}
                </span>
              ))}
              {tech.length > 4 && (
                <span className="text-xs px-2 py-1 text-muted-foreground">
                  +{tech.length - 4} more
                </span>
              )}
            </div>
          </div>

          <motion.div
            className="absolute bottom-6 right-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -10 }}
            whileHover={{ x: 0 }}
          >
            <ArrowRight size={20} />
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}