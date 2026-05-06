"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ReviewFormProps {
  tenantId: string;
}

export function ReviewForm({ tenantId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (rating === 0) {
      setError("Selecione uma nota antes de enviar.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(form);
    const supabase = createClient();

    const { error: err } = await supabase.from("reviews").insert({
      tenant_id: tenantId,
      rating,
      reviewer_name: formData.get("name") as string,
      reviewer_email: formData.get("email") as string,
      comment: (formData.get("comment") as string) || null,
    });

    if (err) {
      setError("Erro ao enviar avaliação. Tente novamente.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <p className="text-lg font-semibold text-gray-900">
          Avaliação enviada!
        </p>
        <p className="text-sm text-gray-500">
          Obrigado pelo seu feedback.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua nota *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-2xl leading-none transition-transform hover:scale-110"
            >
              <span
                className={
                  star <= (hover || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              {["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"][rating]}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            name="name"
            required
            placeholder="Seu nome"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comentário (opcional)
        </label>
        <textarea
          name="comment"
          rows={3}
          placeholder="Conte como foi sua experiência..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enviando..." : "Enviar Avaliação"}
      </Button>
    </form>
  );
}
