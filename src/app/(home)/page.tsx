import type { Metadata } from "next";

import { Hero } from "@/components/landing";
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
    </div>
  );
}
