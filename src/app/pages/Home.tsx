import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight, Sparkles, TrendingUp, Github, Linkedin } from "lucide-react";
import { projects, techStack } from "../data/portfolio-data";
import { ProjectCard } from "../components/ProjectCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Home() {
  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <div className="min-h-screen pt-[4.8rem]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 opacity-20 dark:opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
                <Sparkles size={16} />
                <span>Available for projects</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={16} />
                <span>Open for investors & startups</span>
              </div>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="block text-foreground">AI-Integrated Software Engineer</span>
              <span className="block text-muted-foreground text-3xl sm:text-4xl lg:text-5xl mt-2">
                Lead Developer & Solo Builder
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              I build scalable systems, AI-powered products, and production-ready
              architectures that handle millions of users.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/projects">
                <motion.button
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Projects
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  className="px-8 py-4 bg-muted border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Let's Connect
                </motion.button>
              </Link>
            </motion.div>

            <motion.div variants={item} className="flex items-center justify-center gap-4 pt-2">
              <a
                href="https://www.linkedin.com/in/anjotadena/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary hover:border-primary/50"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://github.com/anjotadena"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary hover:border-primary/50"
              >
                <Github size={20} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Building impactful solutions
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                As a Lead Developer and AI-Integrated Engineer, I specialize in designing
                and building production-ready systems that scale. From architecting
                microservices handling millions of requests to integrating cutting-edge AI
                features, I focus on delivering real business value.
              </p>
              <p>
                Whether you're a startup looking to build your MVP, an investor seeking
                technical expertise, or an enterprise needing scalable solutions—I bring
                the full-stack capabilities and AI integration skills to turn vision into
                reality.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              Tech Stack
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  className="bg-card border border-border rounded-lg p-4 text-center hover:border-primary/50 transition-all"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.1)",
                  }}
                >
                  <span className="text-foreground text-sm font-medium">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Featured Projects
              </h2>
              <Link
                to="/projects"
                className="text-primary hover:opacity-80 transition-opacity flex items-center gap-2 group"
              >
                View all
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} {...project} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-2xl p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to build something impactful?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you're a startup, investor, or enterprise—let's discuss how we can
              work together to bring your vision to life.
            </p>
            <Link to="/contact">
              <motion.button
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get in touch
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
