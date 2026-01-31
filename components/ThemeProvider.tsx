"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import RomanticBackground from "@/components/RomanticBackground";

export type ThemeMode = "day" | "night";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("day");

  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 6;
    setTheme(isNight ? "night" : "day");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "night");
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === "day" ? "night" : "day")),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <RomanticBackground mode={theme} />
      {children}
    </ThemeContext.Provider>
  );
}
