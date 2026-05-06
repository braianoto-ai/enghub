"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

interface ThemeToggleProps {
  /** "default" = cinza adaptável ao tema; "ghost-light" = ícone branco/translúcido (para navs escuros) */
  variant?: "default" | "ghost-light";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    setTheme(stored ?? "system");
  }, []);

  function apply(t: Theme) {
    setTheme(t);
    if (t === "system") {
      localStorage.removeItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      localStorage.setItem("theme", t);
      document.documentElement.classList.toggle("dark", t === "dark");
    }
  }

  const next: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };
  const labels: Record<Theme, string> = { light: "Claro", dark: "Escuro", system: "Sistema" };

  const cls =
    variant === "ghost-light"
      ? "flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
      : "flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800";

  return (
    <button onClick={() => apply(next[theme])} title={`Tema: ${labels[theme]}`} className={cls}>
      {theme === "dark" ? (
        <Moon size={18} />
      ) : theme === "light" ? (
        <Sun size={18} />
      ) : (
        <Monitor size={18} />
      )}
    </button>
  );
}
