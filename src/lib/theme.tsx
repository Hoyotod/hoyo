import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {}, setTheme: () => {} });

function getInitialTheme(): Theme {
  const t = localStorage.getItem("hoyo-theme");
  if (t === "dark" || t === "light") return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("hoyo-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
