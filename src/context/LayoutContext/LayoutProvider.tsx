import { useCallback, useEffect, useMemo, useState } from "react";

import { layout } from "@/constants";
import { LayoutState, LayoutTheme } from "@/types";

import { LayoutContext } from "./LayouContext";

const INIT_STATE: LayoutState = {
  theme: layout.LIGHT,
};

export const LayoutProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [settings, setSettings] = useState<LayoutState>(INIT_STATE);
  const themeMode = settings.theme;

  const updateTheme = useCallback((newTheme: LayoutTheme) => {
    setSettings((prevSettings) => ({ ...prevSettings, theme: newTheme }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(INIT_STATE);
  }, []);

  useEffect(() => {
    const html = document.getElementsByTagName("html")[0];

    if (themeMode === layout.DARK) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [themeMode]);

  return (
    <LayoutContext.Provider
      value={useMemo(
        () => ({
          settings,
          themeMode,
          updateTheme,
          resetSettings,
        }),
        [settings, themeMode, updateTheme, resetSettings]
      )}
    >
      {children}
    </LayoutContext.Provider>
  );
};
