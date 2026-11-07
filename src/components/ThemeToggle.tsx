import { useTheme } from "../lib/theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="neo-btn bg-white dark:bg-neutral-800 text-sm"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀ LIGHT" : "☾ DARK"}
    </button>
  );
}
