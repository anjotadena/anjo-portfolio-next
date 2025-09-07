import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { REM } from "next/font/google";
import Image from "next/image";
import NextTopLoader from "nextjs-toploader";
import { type ReactNode } from "react";

import "@/assets/css/styles.css";

import LightLogo from "@/assets/images/logo-light.png";
import { TopNavBar } from "@/components/layout";

const AppProvidersWrapper = dynamic(() => import("@/AppProviderWrapper"));
const BackToTop = dynamic(() => import("@/components/ui/BackToTop"));
const HydrationProvider = dynamic(() => import("@/components/ui/HydrationProvider"));

const rem = REM({
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Anjo Tadena | Portfolio",
    template: "%s",
  },
  description: "Anjo Tadena",
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: all 15s linear;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.7s forwards;
  z-index: 0;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <style>{splashScreenStyles}</style>
        <meta
          name="google-site-verification"
          content="TxRcVQOjYeQ8g2iSkEgNpT4EaX6bEsJZzZqLIftNNUU"
        />
      </head>
      <body className={rem.className} suppressHydrationWarning={true}>
        <div id="splash-screen">
          <Image
            alt="Logo"
            src={LightLogo}
            height={100}
            style={{ width: "auto" }}
          />
        </div>
        <NextTopLoader color="#0e01ff" />
        <HydrationProvider>
          <div id="__next_splash">
            <AppProvidersWrapper>
              <div className="flex flex-col justify-around item-center min-h-screen">
                <TopNavBar
                  menuItems={["About", "Resume", "Projects", "Blog", "Contact"]}
                  position="sticky"
                />
                <main className="container mx-auto">{children}</main>
                <div className="h-20 flex justify-center align-center py-8 border">
                  &copy; Anjo Tadena. All rights reserved.
                </div>
              </div>
              <BackToTop />
              {/* create footer */}
            </AppProvidersWrapper>
          </div>
        </HydrationProvider>
      </body>
    </html>
  );
}
