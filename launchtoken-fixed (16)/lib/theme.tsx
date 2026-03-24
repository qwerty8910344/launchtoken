'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; toggleTheme: () => void; };
const ThemeContext = createContext<ThemeContextType | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(p => p === "dark" ? "light" : "dark") }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const c = useContext(ThemeContext); if (!c) throw new Error("useTheme must be used within ThemeProvider"); return c; }
