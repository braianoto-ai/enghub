"use client";

import { useState, useEffect, Suspense } from "react";
import { engineeringAreaLabels, slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle, Gift, Eye, EyeOff } from "lucide-react";

const inputClass = "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-zinc-300";

function CadastroForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

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
      options: {
        data: {
          name,
          role,
          slug,
          area: area || "",
          referral_code: refCode || "",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Dispara e-mail de boas-vindas (fire-and-forget)
    fetch("/api/notify/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, slug, hasTrial: true }),
    }).catch(() => null);

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
          {refCode && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800 dark:border-gray-700/50 dark:bg-gray-800/20 dark:text-gray-300">
              <Gift size={16} />
              Você ganhou +30 dias de PRO pelo link de indicação!
            </div>
          )}
          <Link href="/login">
            <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white hover:bg-gray-600">
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
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-12 py-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <span className="text-xl font-bold text-white">Eng<span className="text-gray-400">Hub</span></span>
        </Link>

        <div>
          {refCode ? (
            <>
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-500/30 bg-gray-1000/10 px-4 py-3">
                <Gift size={18} className="shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-300">Você foi indicado!</p>
                  <p className="text-xs text-zinc-400">Cadastre-se e ganhe +30 dias de PRO grátis.</p>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Crie seu perfil<br />profissional grátis
              </h2>
            </>
          ) : (
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Crie seu perfil<br />profissional grátis
            </h2>
          )}
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
                <CheckCircle size={14} className="text-gray-400 shrink-0" />
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
              <span className="font-bold text-white">E</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Eng<span className="text-gray-700">Hub</span></span>
          </Link>

          {/* Badge de indicação */}
          {refCode && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800 dark:border-gray-700/50 dark:bg-gray-800/20 dark:text-gray-300">
              <Gift size={15} className="shrink-0" />
              Você foi indicado por um colega — ganhe +30 dias de PRO ao se cadastrar!
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Criar conta grátis</h1>
          <p className="mt-1 text-sm text-zinc-500">Preencha os dados para começar</p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/api/auth/callback` },
                });
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>

            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signInWithOAuth({
                  provider: "linkedin_oidc",
                  options: { redirectTo: `${window.location.origin}/api/auth/callback` },
                });
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continuar com LinkedIn
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs text-zinc-400">ou com e-mail</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {[
                    { label: "Mínimo 6 caracteres", met: password.length >= 6 },
                    { label: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
                    { label: "Uma letra minúscula", met: /[a-z]/.test(password) },
                    { label: "Um número", met: /[0-9]/.test(password) },
                    { label: "Um caractere especial (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
                  ].map((req) => (
                    <div key={req.label} className="flex items-center gap-1.5 text-xs">
                      <CheckCircle
                        size={13}
                        className={req.met ? "text-green-500" : "text-zinc-400 dark:text-zinc-600"}
                      />
                      <span className={req.met ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-zinc-500"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Confirmar senha</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pr-10 ${confirmPassword.length > 0 && confirmPassword !== password ? "border-red-400 dark:border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="text-xs text-red-500">As senhas não coincidem</p>
              )}
              {confirmPassword.length > 0 && confirmPassword === password && (
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle size={13} className="text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Senhas coincidem</span>
                </div>
              )}
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
              <div className="flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-900">
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

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-gray-700 dark:border-zinc-600"
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" className="underline text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" target="_blank" className="underline text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  Política de Privacidade
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60 mt-2"
            >
              {loading ? "Criando conta..." : (
                <>Criar conta grátis <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-gray-700 hover:underline dark:text-gray-400">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense>
      <CadastroForm />
    </Suspense>
  );
}
