"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
              <span className="text-lg font-bold text-white">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-slate-100">Eng<span className="text-violet-600 dark:text-violet-400">Hub</span></span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/buscar" className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">
              Buscar Profissionais
            </Link>
            <Link href="/planos" className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">
              Planos
            </Link>
            <Link href="/sobre" className="text-sm text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100">
              Sobre
            </Link>
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm">Entrar</Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-slate-800 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href="/buscar" className="text-sm text-gray-600 dark:text-slate-400" onClick={() => setIsOpen(false)}>Buscar Profissionais</Link>
              <Link href="/planos" className="text-sm text-gray-600 dark:text-slate-400" onClick={() => setIsOpen(false)}>Planos</Link>
              <Link href="/sobre" className="text-sm text-gray-600 dark:text-slate-400" onClick={() => setIsOpen(false)}>Sobre</Link>
              <div className="flex gap-3 pt-2">
                <Link href="/login"><Button variant="outline" size="sm">Entrar</Button></Link>
                <Link href="/cadastro"><Button size="sm">Cadastrar</Button></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
