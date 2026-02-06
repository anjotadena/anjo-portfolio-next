import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { site } from "@/config/site";
import { on } from "@/utils";

import { Providers } from "./providers";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.title}`,
    template: `%s | ${site.name}`,
  },
  description: site.tagline,
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta
          name="google-site-verification"
          content="TxRcVQOjYeQ8g2iSkEgNpT4EaX6bEsJZzZqLIftNNUU"
        />
      </head>
      <body
        className={on(
          inter.className,
          inter.variable,
          "min-h-dvh bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50"
        )}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
