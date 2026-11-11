import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/knowledge/repository";

export default function manifest(): MetadataRoute.Manifest {
  const { profile } = getProfile();
  return {
    id: "/",
    name: `${profile.name} — Portfolio`,
    short_name: "anjo_",
    description: `${profile.name} builds software that makes work easier. See his work and ask Anjo AI about it.`,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#111413",
    theme_color: "#111413",
    lang: "en",
    categories: ["productivity", "business"],
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ask Anjo AI", url: "/?assistant=open", icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }] },
      { name: "Contact", url: "/contact", icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }] },
    ],
  };
}
