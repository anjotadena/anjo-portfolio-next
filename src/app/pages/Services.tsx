import React from "react";
import { motion } from "motion/react";
import { services } from "../data/portfolio-data";
import { ServiceCard } from "../components/ServiceCard";

export function Services() {
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
            Services
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
            Comprehensive engineering services from architecture to deployment,
            helping you build scalable, production-ready systems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.title} {...service} index={index} />
          ))}
        </div>

        <motion.div
          className="mt-16 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-2xl p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Need a custom solution?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Every project is unique. Let's discuss how I can help solve your
            specific challenges with tailored solutions.
          </p>
          <motion.a
            href="/contact"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Let's talk
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}