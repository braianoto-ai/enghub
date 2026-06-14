"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, MessageSquare, CornerDownRight, Check, Loader2, Pencil } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
  reviewer_email: string | null;
  reply: string | null;
  reply_at: string | null;
}

interface Props {
  reviews: Review[];
  avgRating: number;
  tenantId: string;
}

const LABELS = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"];

export function AvaliacoesClient({ reviews, avgRating, tenantId }: Props) {
  const supabase = createClient();
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [localReplies, setLocalReplies] = useState<Record<string, string>>({});

  const recommend = reviews.length > 0
    ? Math.round((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100)
    : 0;

  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  }));

  async function handleSaveReply(reviewId: string) {
    if (!replyText.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("reviews")
      .update({ reply: replyText.trim(), reply_at: new Date().toISOString() })
      .eq("id", reviewId)
      .eq("tenant_id", tenantId);

    if (!error) {
      setLocalReplies((prev) => ({ ...prev, [reviewId]: replyText.trim() }));
      setReplyingId(null);
      setReplyText("");
    }
    setSaving(false);
  }

  function startReply(r: Review) {
    setReplyingId(r.id);
    setReplyText(localReplies[r.id] ?? r.reply ?? "");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Avaliações</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Gerencie e responda as avaliações dos seus clientes</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </p>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={14} className={s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-zinc-700"} />
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Média geral</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100">{reviews.length}</p>
          <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">Total de avaliações</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100">{recommend}%</p>
          <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">Deram 5 estrelas</p>
        </div>
      </div>

      {/* Histogram */}
      {reviews.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">Distribuição</p>
          <div className="space-y-2">
            {histogram.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-4 text-right text-xs font-medium text-gray-500 dark:text-zinc-400">{star}</span>
                <Star size={11} className="shrink-0 fill-yellow-400 text-yellow-400" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-xs text-gray-400 dark:text-zinc-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-zinc-700">
            <MessageSquare size={32} className="mb-2 text-gray-300 dark:text-zinc-600" />
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">Nenhuma avaliação ainda</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">Compartilhe seu perfil para receber avaliações</p>
          </div>
        ) : (
          reviews.map((r) => {
            const displayName = r.reviewer_name ?? "Anônimo";
            const initials = displayName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            const currentReply = localReplies[r.id] ?? r.reply;
            const isReplying = replyingId === r.id;

            return (
              <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">{displayName}</p>
                        {r.reviewer_email && (
                          <p className="text-xs text-gray-400 dark:text-zinc-500">{r.reviewer_email}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={12} className={s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-zinc-700"} />
                          ))}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-zinc-500">
                          {LABELS[r.rating]} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">{r.comment}</p>
                    )}

                    {/* Existing reply */}
                    {currentReply && !isReplying && (
                      <div className="mt-3 flex gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                        <CornerDownRight size={13} className="mt-0.5 shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Sua resposta</p>
                          <p className="mt-0.5 text-sm text-gray-700 dark:text-zinc-300">{currentReply}</p>
                        </div>
                        <button onClick={() => startReply(r)} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300" title="Editar resposta">
                          <Pencil size={13} />
                        </button>
                      </div>
                    )}

                    {/* Reply input */}
                    {isReplying ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          placeholder="Escreva sua resposta pública..."
                          autoFocus
                          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveReply(r.id)}
                            disabled={saving || !replyText.trim()}
                            className="flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-40"
                          >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Publicar resposta
                          </button>
                          <button
                            onClick={() => { setReplyingId(null); setReplyText(""); }}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:border-zinc-700 dark:text-zinc-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : !currentReply ? (
                      <button onClick={() => startReply(r)} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                        <CornerDownRight size={12} />
                        Responder publicamente
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
