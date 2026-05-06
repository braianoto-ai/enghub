"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { engineeringAreaLabels, slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const inputClass = "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-zinc-300";

export default function CadastroPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const area = formData.get("area") as string;
    const slugInput = formData.get("slug") as string;

    const supabase = createClient();
    const slug = slugInput || slugify(name);

    if (role === "PROFESSIONAL") {
      const { data: existingSlug } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existingSlug) {
        setError("Esta URL já está em uso. Escolha outra.");
        setLoading(false);
        return;
      }
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role, slug, area: area || "" } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">Conta criada!</h2>
          <p className="mt-2 text-zinc-500">
            Verifique seu e-mail para confirmar a conta e fazer login.
          </p>
          <Link href="/login">
            <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500">
              Ir para o login <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950/60 px-12 py-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-white">Eng<span className="text-violet-400">Hub</span></span>
        </Link>

        <div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Crie seu perfil<br />profissional grátis
          </h2>
          <p className="mt-4 text-zinc-400">
            Mostre seus projetos, receba avaliações e conecte-se com clientes em todo o Brasil.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Portfólio profissional completo",
              "Apareça nas buscas do EngHub",
              "Receba mensagens e orçamentos",
              "Analytics de visitas ao perfil",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                <CheckCircle size={14} className="text-violet-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-600">© 2026 EngHub. Todos os direitos reservados.</p>
      </div>

      {/* Right — form */}
      <div className="flex w-full lg:w-3/5 flex-col items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <span className="font-bold text-white">E</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Eng<span className="text-violet-600">Hub</span></span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Criar conta grátis</h1>
          <p className="mt-1 text-sm text-zinc-500">Preencha os dados para começar</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className={labelClass}>Nome completo</label>
              <input name="name" type="text" placeholder="João Silva" required className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>E-mail</label>
              <input name="email" type="email" placeholder="seu@email.com" required className={inputClass} />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Senha</label>
              <input name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Tipo de conta</label>
                <select name="role" required className={inputClass}>
                  <option value="PROFESSIONAL">Profissional</option>
                  <option value="CLIENT">Cliente</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Área de atuação</label>
                <select name="area" className={inputClass}>
                  <option value="">Selecione</option>
                  {Object.entries(engineeringAreaLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>URL do perfil</label>
              <div className="flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900">
                <span className="pl-4 text-sm text-zinc-400 whitespace-nowrap">enghub.com.br/</span>
                <input
                  name="slug"
                  type="text"
                  placeholder="joao-silva"
                  pattern="[a-z0-9-]+"
                  className="flex-1 rounded-r-xl bg-transparent px-2 py-2.5 text-sm text-gray-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60 mt-2"
            >
              {loading ? "Criando conta..." : (
                <>Criar conta grátis <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
