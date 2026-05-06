"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { engineeringAreaLabels } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NovoServico() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!tenant) { setError("Tenant não encontrado."); setLoading(false); return; }

    const formData = new FormData(form);
    const priceFrom = formData.get("price_from") as string;
    const priceTo = formData.get("price_to") as string;

    const { error: err } = await supabase.from("services").insert({
      tenant_id: tenant.id,
      title: formData.get("title"),
      description: formData.get("description") || null,
      area: formData.get("area"),
      price_from: priceFrom ? parseFloat(priceFrom) : null,
      price_to: priceTo ? parseFloat(priceTo) : null,
      is_active: true,
    });

    if (err) {
      setError("Erro ao criar serviço: " + err.message);
    } else {
      router.push("/dashboard/servicos");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/servicos">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Serviço</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              name="title"
              label="Título"
              placeholder="Ex: Projeto estrutural residencial"
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <select
                name="area"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Selecione a área</option>
                {Object.entries(engineeringAreaLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                name="description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                rows={3}
                placeholder="Descreva o serviço oferecido..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="price_from"
                name="price_from"
                type="number"
                label="Preço a partir de (R$)"
                placeholder="0,00"
                min="0"
                step="0.01"
              />
              <Input
                id="price_to"
                name="price_to"
                type="number"
                label="Preço até (R$)"
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/servicos">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button disabled={loading}>{loading ? "Salvando..." : "Salvar Serviço"}</Button>
        </div>
      </form>
    </div>
  );
}
