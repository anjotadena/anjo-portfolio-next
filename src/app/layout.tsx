import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerManager } from "@/components/pwa/service-worker-manager";
import { PageViewTracker, VercelAnalytics } from "@/components/analytics/vercel-analytics";
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
    applicationName: profile.name,
    alternates: { canonical: "/" },
    openGraph: { title, description: summary, url: siteUrl, siteName: profile.name, type: "website", locale: "en_US" },
    twitter: { card: "summary", title, description: summary },
    robots: { index: true, follow: true },
    appleWebApp: { capable: true, title: profile.name, statusBarStyle: "black-translucent" },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Chrome on Android: the layout viewport shrinks with the software
  // keyboard so the assistant composer stays visible.
  interactiveWidget: "resizes-content",
  colorScheme: "dark",
  themeColor: "#111413",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <ServiceWorkerManager />
          <PageViewTracker />
          {process.env.VERCEL === "1" && <VercelAnalytics />}
        </ThemeProvider>
      </body>
    </html>
  );
}
