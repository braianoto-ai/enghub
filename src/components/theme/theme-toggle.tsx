"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  variant?: "default" | "ghost-light";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  const cls =
    variant === "ghost-light"
      ? "flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
      : "flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800";

  return (
    <button onClick={toggle} title={isDark ? "Modo claro" : "Modo escuro"} className={cls}>
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
