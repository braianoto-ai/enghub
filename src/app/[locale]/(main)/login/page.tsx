"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Shield, Star, Users } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("E-mail ou senha inválidos");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
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
            Bem-vindo de<br />volta ao EngHub
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Gerencie seu portfólio, receba clientes e acompanhe seu crescimento.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Shield, text: "Perfil verificado com CREA/CAU" },
              { icon: Star,   text: "Avaliações reais de clientes" },
              { icon: Users,  text: "Rede de profissionais em todo o Brasil" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-zinc-300">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700/40">
                  <item.icon size={15} className="text-gray-400" />
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
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

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entrar na sua conta</h1>
          <p className="mt-1 text-sm text-zinc-500">Acesse seu painel profissional</p>

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

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -tranzinc-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60"
            >
              {loading ? "Entrando..." : (
                <>Entrar <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-gray-700 hover:underline dark:text-gray-400">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
