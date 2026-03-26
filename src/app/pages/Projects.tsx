import { motion } from "motion/react";
import { projects } from "../data/portfolio-data";
import { ProjectCard } from "../components/ProjectCard";

export function Projects() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Projects
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
            Case studies of production systems, AI integrations, and scalable
            architectures that drive real business impact.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} {...project} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}