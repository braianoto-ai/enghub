"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

const FLAG: Record<string, string> = { pt: "🇧🇷", en: "🇺🇸" };
const LABEL: Record<string, string> = { pt: "PT", en: "EN" };

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    if (next === locale) return;

    // Strip current locale prefix if present
    let path = pathname;
    for (const l of routing.locales) {
      if (l !== routing.defaultLocale && path.startsWith(`/${l}`)) {
        path = path.slice(`/${l}`.length) || "/";
        break;
      }
    }

    // Add new locale prefix if not default
    const newPath = next === routing.defaultLocale ? path : `/${next}${path}`;
    router.push(newPath);
  }

  const nextLocale = locale === "pt" ? "en" : "pt";

  const cls =
    variant === "light"
      ? "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
      : "flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";

  return (
    <button onClick={() => switchLocale(nextLocale)} className={cls} title={`Switch to ${nextLocale.toUpperCase()}`}>
      <span>{FLAG[nextLocale]}</span>
      <span>{LABEL[nextLocale]}</span>
    </button>
  );
}
