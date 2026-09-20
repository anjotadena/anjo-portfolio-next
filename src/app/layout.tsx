import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { getProfile } from "@/lib/knowledge/repository";
import { getSiteUrl } from "@/lib/seo/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export function generateMetadata(): Metadata {
  const { profile, summary } = getProfile();
  const siteUrl = getSiteUrl();
  const title = `${profile.name} | ${profile.headline}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${profile.name}` },
    description: summary,
    applicationName: "Anjo AI",
    alternates: { canonical: "/" },
    openGraph: { title, description: summary, url: siteUrl, siteName: `${profile.name} — Anjo AI`, type: "website", locale: "en_US" },
    twitter: { card: "summary", title, description: summary },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
