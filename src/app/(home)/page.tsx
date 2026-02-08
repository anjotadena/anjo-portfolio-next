import type { Metadata } from "next";

import {
  Hero,
  Highlights,
  About,
  FeaturedProjects,
  ExperiencePreview,
  Skills,
  Testimonials,
  Contact,
} from "@/components/landing";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `${site.name} | ${site.title}`,
  description: site.tagline,
  openGraph: {
    title: `${site.name} | ${site.title}`,
    description: site.tagline,
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="snap-container">
      {/* Hero Section with AI Chat */}
      <Hero />

      {/* Quick Stats Highlights */}
      <Highlights />

      {/* About / Expertise Areas */}
      <About />

      {/* Featured Projects Showcase */}
      <FeaturedProjects />

      {/* Experience Preview */}
      <ExperiencePreview />

      {/* Skills & Tech Stack */}
      <Skills />

      {/* Testimonials */}
      <Testimonials />

      {/* Contact Section */}
      <Contact />
    </div>
  );
}
