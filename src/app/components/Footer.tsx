import React from "react";
import { motion } from "motion/react";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:tadena.anjo@gmail.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={label}
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}