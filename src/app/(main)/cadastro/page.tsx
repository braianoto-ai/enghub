"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { engineeringAreaLabels, slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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

    // Verifica slug duplicado antes de cadastrar
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

    // O trigger handle_new_user cria o tenant automaticamente via metadata
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, slug, area: area || "" },
      },
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
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Cadastro realizado!
            </h2>
            <p className="mt-2 text-gray-500">
              Verifique seu e-mail para confirmar a conta e fazer login.
            </p>
            <Link href="/login">
              <Button className="mt-6">Fazer login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xl font-bold text-white">E</span>
          </div>
          <CardTitle className="mt-4 text-2xl">Criar conta no EngHub</CardTitle>
          <p className="mt-1 text-sm text-gray-500">
            Crie seu perfil profissional gratuitamente
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              id="name"
              name="name"
              label="Nome completo"
              placeholder="João Silva"
              required
            />
            <Input
              id="email"
              name="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
            />
            <Input
              id="password"
              name="password"
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de conta
              </label>
              <select
                name="role"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="PROFESSIONAL">Profissional / Empresa</option>
                <option value="CLIENT">Cliente</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Área de atuação
              </label>
              <select
                name="area"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione (opcional para clientes)</option>
                {Object.entries(engineeringAreaLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="slug"
              name="slug"
              label="URL do perfil"
              placeholder="joao-silva"
              pattern="[a-z0-9-]+"
              title="Apenas letras minúsculas, números e hífens"
            />
            <p className="text-xs text-gray-400">
              Seu perfil ficará em: enghub.com.br/joao-silva
            </p>

            <Button className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Já tem conta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Fazer login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
