import Link from "next/link";
import { Search, Home, UserX } from "lucide-react";

export default function TenantNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-100/50 blur-3xl dark:bg-gray-900/20" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Eng<span className="text-gray-700 dark:text-gray-400">Hub</span>
          </span>
        </Link>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <UserX size={36} className="text-zinc-400 dark:text-zinc-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profissional não encontrado
        </h1>
        <p className="mt-3 text-gray-500 dark:text-zinc-400">
          O perfil que você procura não existe, foi removido ou ainda não foi ativado.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/buscar"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 sm:w-auto"
          >
            <Search size={15} />
            Buscar engenheiros
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:w-auto"
          >
            <Home size={15} />
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
