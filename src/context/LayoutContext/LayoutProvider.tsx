import { useEffect, useMemo, useState } from "react";

import { layout } from "@/constants";
import { LayoutState, LayoutTheme } from "@/types";

import { LayoutContext } from "./LayouContext";

export const LayoutProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const INIT_STATE: LayoutState = {
    theme: layout.LIGHT,
  };
  const [settings, setSettings] = useState<LayoutState>(INIT_STATE);
  const themeMode = settings.theme;

  const updateSettings = (_newSettings: Partial<LayoutState>) => {
    setSettings({ ...settings, ..._newSettings });
  };

  const updateTheme = (newTheme: LayoutTheme) => {
    updateSettings({ ...settings, theme: newTheme });
  };

  const resetSettings = () => {
    setSettings(INIT_STATE);
  };

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
        [settings, themeMode]
      )}
    >
      {children}
    </LayoutContext.Provider>
  );
};
