"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

interface ContatoFormProps {
  tenantId: string;
  tenantName: string;
}

export function ContatoForm({ tenantId, tenantName }: ContatoFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");

    const formData = new FormData(form);
    const supabase = createClient();

    const { error: err } = await supabase.from("contact_messages").insert({
      tenant_id: tenantId,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      message: formData.get("message"),
    });

    if (err) {
      setError("Erro ao enviar mensagem. Tente novamente.");
    } else {
      setSuccess(true);
      form.reset();
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Mensagem enviada!
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {tenantName} receberá sua mensagem em breve.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      <Input
        id="name"
        name="name"
        label="Seu nome"
        placeholder="João Silva"
        required
      />
      <Input
        id="email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="joao@email.com"
        required
      />
      <Input
        id="phone"
        name="phone"
        label="Telefone (opcional)"
        placeholder="(11) 99999-9999"
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Mensagem
        </label>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Descreva o que você precisa..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}
