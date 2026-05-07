"use client";

import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -tranzinc-x-1/2 -tranzinc-y-1/2 rounded-full bg-gray-1000/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          <WifiOff size={36} className="text-zinc-400 dark:text-zinc-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sem conexão
        </h1>
        <p className="mt-3 text-gray-500 dark:text-zinc-400">
          Você está offline. Verifique sua conexão com a internet e tente novamente.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
        >
          <RefreshCw size={15} />
          Tentar novamente
        </button>

        <Link
          href="/"
          className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
