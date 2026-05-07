"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  function switchTo(next: "pt" | "en") {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 flex items-center rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-500 dark:border-zinc-700 dark:bg-zinc-900 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
      onMouseEnter={() => setVisible(true)}
    >
      <button
        onClick={() => switchTo("pt")}
        className={`rounded-l-[11px] px-3.5 py-2 text-xs font-semibold transition-colors ${
          locale === "pt"
            ? "bg-gray-700 text-white"
            : "text-gray-500 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
        }`}
      >
        PT
      </button>
      <button
        onClick={() => switchTo("en")}
        className={`rounded-r-[11px] px-3.5 py-2 text-xs font-semibold transition-colors ${
          locale === "en"
            ? "bg-gray-700 text-white"
            : "text-gray-500 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
        }`}
      >
        EN
      </button>
    </div>
  );
}
