import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { REM } from "next/font/google";
import Image from "next/image";
import NextTopLoader from "nextjs-toploader";
import { type ReactNode } from "react";

import "@/assets/css/styles.css";

import { TopNavBar } from "@/components/layout";

const AppProvidersWrapper = dynamic(
  () => import("@/AppProviderWrapper")
);
const BackToTop = dynamic(() => import("@/components/ui/BackToTop"));

const rem = REM({
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "2Bit Synergy",
    template: "%s",
  },
  description: "2bitsynerg Description",
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
    <html lang="en">
      <head>
        <style>{splashScreenStyles}</style>
      </head>
      <body className={rem.className}>
        <div id="splash-screen">
          <Image
            alt="Logo"
            width={355}
            height={83}
            src={"/assets/images/logo.svg"}
            style={{ height: "10%", width: "auto" }}
          />
        </div>
        <NextTopLoader color="#0e01ff" showSpinner={false} />
        <div id="__next_splash">
          <AppProvidersWrapper>
            <TopNavBar menuItems={["About", "Resume", "Projects", "Contact"]} position="fixed" />
            {children}
            <BackToTop />
          </AppProvidersWrapper>
        </div>
      </body>
    </html>
  );
}
