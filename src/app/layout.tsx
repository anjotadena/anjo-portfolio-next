import type { Metadata } from "next";
import { REM } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { on } from "@/utils";

import { Providers } from "./providers";

const rem = REM({
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Senior Software Engineer / Lead Developer",
    template: "%s | Portfolio",
  },
  description:
    "Minimal portfolio for a Senior Software Engineer / Lead Developer: projects, architecture, leadership, and contact.",
  icons: {
    icon: [{ url: "/favicon.ico" }],
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
          rem.className,
          "min-h-dvh bg-white text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50"
        )}
      >
        <Providers>
          <a
            href="#content"
            className={on(
              "sr-only focus:not-sr-only",
              "fixed left-4 top-4 z-50 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
              "dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-50"
            )}
          >
            Skip to content
          </a>
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
