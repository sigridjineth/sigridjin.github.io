"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(next);
  };

  return (
    <button
      onClick={cycle}
      aria-label="Toggle theme"
      className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-xs"
    >
      {theme === "dark" ? "[dark]" : theme === "light" ? "[light]" : "[auto]"}
    </button>
  );
}
