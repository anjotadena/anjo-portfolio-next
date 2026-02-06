import type { Metadata } from "next";

import {
  About,
  AskAiButton,
  ExperiencePreview,
  FeaturedProjects,
  Hero,
  Highlights,
  Skills,
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
    <>
      {/* Hero Section */}
      <Hero />

      {/* Quick Highlights Strip */}
      <Highlights />

      {/* Experience Preview */}
      <ExperiencePreview />

      {/* Featured Projects */}
      <FeaturedProjects />

      {/* About / Expertise */}
      <About />

      {/* Skills & Contact */}
      <Skills />

      {/* Floating Ask AI Button */}
      <AskAiButton />
    </>
  );
}
