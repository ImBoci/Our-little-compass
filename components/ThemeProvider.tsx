"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import RomanticBackground from "@/components/RomanticBackground";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "day";
    const stored = window.localStorage.getItem("theme");
    if (stored === "day" || stored === "night") {
      return stored;
    }
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "night" : "day";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("theme");
    if (stored === "day" || stored === "night") {
      setTheme(stored);
      return;
    }
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "night" : "day");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    window.localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
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

  const content = (
    <Providers>
      {children}
      <Toaster />
    </Providers>
  );

  if (!mounted) {
    return <ThemeContext.Provider value={value}>{content}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider value={value}>
      <RomanticBackground />
      {content}
    </ThemeContext.Provider>
  );
}
