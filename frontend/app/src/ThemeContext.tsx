import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "void" | "slate" | "obsidian";
type Density = "comfortable" | "compact";
type Effects = "standard" | "reduced";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  density: Density;
  setDensity: (d: Density) => void;
  effects: Effects;
  setEffects: (e: Effects) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => 
    (localStorage.getItem("coc-theme") as Theme) || "void"
  );
  
  const [density, setDensityState] = useState<Density>(() => 
    (localStorage.getItem("coc-density") as Density) || "comfortable"
  );

  const [effects, setEffectsState] = useState<Effects>(() => 
    (localStorage.getItem("coc-effects") as Effects) || "standard"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("coc-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
    localStorage.setItem("coc-density", density);
  }, [density]);

  useEffect(() => {
    document.documentElement.setAttribute("data-effects", effects);
    localStorage.setItem("coc-effects", effects);
  }, [effects]);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme: setThemeState,
      density, setDensity: setDensityState,
      effects, setEffects: setEffectsState
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
