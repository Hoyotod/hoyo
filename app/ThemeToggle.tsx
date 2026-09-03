"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <span aria-hidden className="inline-flex w-11 h-11" />;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="bg-white text-black border-4 border-black px-3 py-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all dark:bg-gray-800 dark:text-white dark:border-gray-600"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
