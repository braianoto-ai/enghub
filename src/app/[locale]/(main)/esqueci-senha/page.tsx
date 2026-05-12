"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
            E-mail enviado!
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Se existe uma conta com <strong className="text-gray-700 dark:text-zinc-300">{email}</strong>, você receberá um link para redefinir sua senha.
          </p>
          <p className="mt-4 text-xs text-zinc-400">
            Não recebeu? Verifique sua caixa de spam ou tente novamente.
          </p>
          <div className="mt-8 space-y-3">
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Tentar outro e-mail
            </button>
            <Link href="/login">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white hover:bg-gray-600 mt-2">
                <ArrowLeft size={15} /> Voltar ao login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-12 py-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-white">Eng<span className="text-gray-400">Hub</span></span>
        </Link>

        <div>
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Recupere o acesso<br />à sua conta
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Enviaremos um link seguro para você redefinir sua senha.
          </p>
        </div>

        <p className="text-xs text-zinc-600">© 2026 EngHub. Todos os direitos reservados.</p>
      </div>

      {/* Right — form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
              <span className="font-bold text-white">E</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Eng<span className="text-gray-700">Hub</span></span>
          </Link>

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Mail size={22} className="text-gray-600 dark:text-gray-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Esqueci minha senha</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link href="/login" className="inline-flex items-center gap-1 font-medium text-gray-700 hover:underline dark:text-gray-400">
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
