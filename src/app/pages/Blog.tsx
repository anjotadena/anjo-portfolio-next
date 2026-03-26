import React from "react";
import { motion } from "motion/react";
import { blogPosts } from "../data/portfolio-data";
import { BlogCard } from "../components/BlogCard";

export function Blog() {
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
            Blog
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
            Insights on software architecture, AI integration, and building
            production-ready systems that scale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
            <BlogCard key={post.id} {...post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}