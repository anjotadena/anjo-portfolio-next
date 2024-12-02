"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Change document title based on tab visibility
 */
const handleChangeTitle = () => {
  if (document.visibilityState === "hidden") {
    document.title = "Anjo Tadena";
  } else {
    document.title = "Portfolio";
  }
};

const AppProviderWrapper = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const pathname = usePathname();

  useEffect(() => {
    if (document) {
      const e = document.querySelector<HTMLDivElement>("#__next_splash");

      if (e?.hasChildNodes()) {
        document.querySelector("#splash-screen")?.classList.add("remove");
      }

      e?.addEventListener("DOMNodeInserted", () => {
        document.querySelector("#splash-screen")?.classList.add("remove");
      });
    }

    import("preline/preline");

    document.addEventListener("visibilitychange", handleChangeTitle);

    return () => {
      document.removeEventListener("visibilitychange", handleChangeTitle);
    };
  });

  useEffect(() => {
    setTimeout(() => {
      // if (window.HSStat)
    });
  });
};

export default AppProviderWrapper;
