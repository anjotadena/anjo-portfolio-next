import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/knowledge/repository";

export default function manifest(): MetadataRoute.Manifest {
  const { profile } = getProfile();
  return {
    id: "/",
    name: `Anjo AI — ${profile.name}`,
    short_name: "Anjo AI",
    description: `Ask ${profile.name}'s AI portfolio about his experience, projects, and skills.`,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    lang: "en",
    categories: ["productivity", "business"],
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ask about projects", url: "/?ask=Show%20me%20his%20AI%20projects", icons: [{ src: "/icons/icon-192", sizes: "192x192" }] },
      { name: "Contact", url: "/contact", icons: [{ src: "/icons/icon-192", sizes: "192x192" }] },
    ],
  };
}
