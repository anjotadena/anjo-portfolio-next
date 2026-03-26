import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  index: number;
}

export function BlogCard({ id, title, excerpt, date, readTime, tags, index }: BlogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/blog/${id}`}>
        <motion.article
          className="group bg-card backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
          whileHover={{ y: -4 }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {readTime}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              {excerpt}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Read more <ArrowRight size={16} />
            </div>
          </div>
        </motion.article>
      </Link>
    </motion.div>
  );
}