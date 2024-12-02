"use client";

import { LuChevronUp, LuMoon, LuSun } from "react-icons/lu";

import { layout } from "@/constants";
import { useLayoutContext } from "@/context/LayoutContext";
import { useScrollEvent } from "@/hooks";

const BackToTop = () => {
  const { scrollY } = useScrollEvent();

  const { themeMode, updateTheme } = useLayoutContext();

  const toggleThemeMode = () => {
    updateTheme(themeMode === layout.LIGHT ? layout.DARK : layout.LIGHT);
  };

  return (
    <div className="fixed bottom-5 end-5 z-[40] flex flex-col items-center gap-1">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary shadow-[inset_0px_0px_12px_0px] shadow-primary/40 backdrop-blur-3xl transition-all duration-500 ${
          scrollY < 72 && "translate-x-16"
        }`}
      >
        <LuChevronUp className="h-4 w-4" />
      </button>
      <button className="z-20 rounded-lg bg-primary text-white">
        <span
          className="flex h-9 w-9 items-center justify-center"
          onClick={toggleThemeMode}
          id="dark-theme"
        >
          {themeMode === layout.DARK ? (
            <LuSun className="h-5 w-5" />
          ) : (
            <LuMoon className="h-5 w-5" />
          )}
        </span>
      </button>
    </div>
  );
};

export default BackToTop;
