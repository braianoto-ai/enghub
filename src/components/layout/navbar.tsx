"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();

  const prefix = locale === "en" ? "/en" : "";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={`${prefix}/`} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700">
              <span className="text-lg font-bold text-white">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-zinc-100">Eng<span className="text-gray-700 dark:text-gray-400">Hub</span></span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href={`${prefix}/buscar`} className="text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t("search")}
            </Link>
            <Link href={`${prefix}/planos`} className="text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t("plans")}
            </Link>
            <Link href={`${prefix}/blog`} className="text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t("blog")}
            </Link>
            <Link href={`${prefix}/sobre`} className="text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t("about")}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm">{t("login")}</Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm">{t("signup")}</Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-zinc-800 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href={`${prefix}/buscar`} className="text-sm text-gray-600 dark:text-zinc-400" onClick={() => setIsOpen(false)}>{t("search")}</Link>
              <Link href={`${prefix}/planos`} className="text-sm text-gray-600 dark:text-zinc-400" onClick={() => setIsOpen(false)}>{t("plans")}</Link>
              <Link href={`${prefix}/blog`} className="text-sm text-gray-600 dark:text-zinc-400" onClick={() => setIsOpen(false)}>{t("blog")}</Link>
              <Link href={`${prefix}/sobre`} className="text-sm text-gray-600 dark:text-zinc-400" onClick={() => setIsOpen(false)}>{t("about")}</Link>
              <div className="flex gap-3 pt-2">
                <Link href="/login"><Button variant="outline" size="sm">{t("login")}</Button></Link>
                <Link href="/cadastro"><Button size="sm">{t("signup")}</Button></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
