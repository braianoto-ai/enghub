"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: "pt" | "en") {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-700">
      <button
        onClick={() => switchTo("pt")}
        className={`rounded-l-[7px] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          locale === "pt"
            ? "bg-gray-700 text-white"
            : "text-gray-500 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
        }`}
      >
        PT
      </button>
      <button
        onClick={() => switchTo("en")}
        className={`rounded-r-[7px] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
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
