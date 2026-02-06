import type { Metadata } from "next";
import { REM } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SiteFooter } from "@/components/site/SiteFooter";
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
    default: "Software Engineer",
    template: "%s | Portfolio",
  },
  description:
    "Minimal portfolio for a Software Engineer: projects, architecture, leadership, and contact.",
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
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <main id="content" className="flex flex-1 items-center justify-center">
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
