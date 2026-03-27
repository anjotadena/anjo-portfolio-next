import React from "react";
import { motion } from "motion/react";
import { Mail, MapPin, Building2 } from "lucide-react";

export function Contact() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Let's build something impactful
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a startup, investor, or enterprise—I'd love to hear from you
            and explore how we can work together.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Get in touch</h2>
              
              <div className="space-y-6">
                <motion.div
                  className="flex items-start gap-4"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Email</h3>
                    <a
                      href="mailto:tadena.anjo@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      tadena.anjo@gmail.com
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-4"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Location</h3>
                    <p className="text-muted-foreground">Remote / Worldwide</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-4"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="text-emerald-600 dark:text-emerald-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Open For</h3>
                    <p className="text-muted-foreground">Investors, Startups, Enterprises</p>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Typical Response Time
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                I usually respond within 24 hours during business days. For urgent
                projects or investment inquiries, feel free to mention it in your message.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">What to expect</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Initial consultation to understand your needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Detailed proposal with timeline and deliverables</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Regular updates throughout the project</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Production-ready code and documentation</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
