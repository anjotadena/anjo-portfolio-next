import React from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { projects } from "../data/portfolio-data";

export function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Project not found</h1>
          <Link to="/projects" className="text-primary hover:opacity-80 flex items-center gap-2 justify-center">
            <ArrowLeft size={20} />
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back to projects
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {project.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary text-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {Object.entries(project.metrics).map(([key, value]) => (
              <motion.div
                key={key}
                className="bg-card border border-border rounded-lg p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-primary mb-2">{value}</div>
                <div className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </motion.div>
            ))}
          </div>

          {/* Case Study */}
          <div className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed">{project.problem}</p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">The Solution</h2>
              <p className="text-muted-foreground leading-relaxed">{project.solution}</p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">The Impact</h2>
              <p className="text-muted-foreground leading-relaxed">{project.impact}</p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Technology Stack</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {project.tech.map((tech) => (
                  <div
                    key={tech}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <ExternalLink size={16} className="text-primary" />
                    {tech}
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
