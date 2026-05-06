import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-zinc-950">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-1000/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="mb-10 inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Eng<span className="text-gray-700">Hub</span>
          </span>
        </Link>

        {/* 404 */}
        <div className="mb-6 select-none">
          <span className="bg-gradient-to-br from-gray-600 to-gray-500 bg-clip-text text-[120px] font-black leading-none tracking-tight text-transparent">
            404
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Página não encontrada
        </h1>
        <p className="mt-3 text-gray-500 dark:text-zinc-400">
          O endereço que você acessou não existe ou foi removido.
          <br />
          Verifique o link ou volte para a página inicial.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 sm:w-auto"
          >
            <Home size={15} />
            Ir para o início
          </Link>
          <Link
            href="/buscar"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:w-auto"
          >
            <Search size={15} />
            Buscar engenheiros
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => history.back()}
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 mx-auto"
        >
          <ArrowLeft size={13} />
          Voltar à página anterior
        </button>
      </div>
    </div>
  );
}
