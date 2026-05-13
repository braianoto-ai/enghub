"use client";

import { useState, useTransition } from "react";
import { Quote, Trash2, Plus, Star, GripVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  content: string;
  avatar_url: string | null;
  featured: boolean;
  position: number;
}

interface DepoimentosClientProps {
  tenantId: string;
  initialTestimonials: Testimonial[];
}

const EMPTY_FORM = { author_name: "", author_title: "", content: "", avatar_url: "", featured: false };

export function DepoimentosClient({ tenantId, initialTestimonials }: DepoimentosClientProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id);
    setForm({
      author_name: t.author_name,
      author_title: t.author_title ?? "",
      content: t.content,
      avatar_url: t.avatar_url ?? "",
      featured: t.featured,
    });
    setError(null);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.author_name.trim() || !form.content.trim()) {
      setError("Nome e depoimento são obrigatórios.");
      return;
    }

    startTransition(async () => {
      const payload = {
        tenant_id: tenantId,
        author_name: form.author_name.trim(),
        author_title: form.author_title.trim() || null,
        content: form.content.trim(),
        avatar_url: form.avatar_url.trim() || null,
        featured: form.featured,
      };

      if (editingId) {
        const { data, error: err } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
        if (err) { setError(err.message); return; }
        setTestimonials((prev) => prev.map((t) => t.id === editingId ? { ...t, ...data } : t));
      } else {
        const { data, error: err } = await supabase
          .from("testimonials")
          .insert({ ...payload, position: testimonials.length })
          .select()
          .single();
        if (err) { setError(err.message); return; }
        setTestimonials((prev) => [...prev, data]);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setError(null);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await supabase.from("testimonials").delete().eq("id", id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    });
  }

  function toggleFeatured(t: Testimonial) {
    startTransition(async () => {
      await supabase.from("testimonials").update({ featured: !t.featured }).eq("id", t.id);
      setTestimonials((prev) => prev.map((item) => item.id === t.id ? { ...item, featured: !item.featured } : item));
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Depoimentos</h1>
          <p className="mt-1 text-gray-500 dark:text-zinc-400">
            Adicione citações de clientes e parceiros para exibir no seu perfil
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> Adicionar
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-zinc-100">
            {editingId ? "Editar depoimento" : "Novo depoimento"}
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Nome do autor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Cargo / empresa
                </label>
                <input
                  type="text"
                  placeholder="Ex: CEO na Construtora XYZ"
                  value={form.author_title}
                  onChange={(e) => setForm({ ...form, author_title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Depoimento <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="O que o cliente disse sobre você..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                URL do avatar (opcional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded"
              />
              Destacar no topo do perfil
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setError(null); }}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-6 space-y-4">
        {testimonials.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
            <Quote size={36} className="text-gray-300 dark:text-zinc-600" />
            <p className="text-gray-500 dark:text-zinc-400">Nenhum depoimento ainda</p>
            <p className="text-sm text-gray-400 dark:text-zinc-500">
              Adicione citações de clientes satisfeitos para fortalecer sua credibilidade
            </p>
            <Button onClick={openCreate} variant="outline" className="mt-2 gap-2">
              <Plus size={15} /> Adicionar primeiro depoimento
            </Button>
          </div>
        )}

        {testimonials.map((t) => (
          <div
            key={t.id}
            className={`relative rounded-2xl border bg-white p-5 dark:bg-zinc-900 ${
              t.featured
                ? "border-yellow-300 dark:border-yellow-600/40"
                : "border-gray-200 dark:border-zinc-700"
            }`}
          >
            {t.featured && (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                <Star size={10} className="fill-yellow-400 text-yellow-400" /> Destaque
              </span>
            )}

            <div className="flex items-start gap-3">
              <GripVertical size={16} className="mt-1 shrink-0 text-gray-300 dark:text-zinc-600" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image src={t.avatar_url} alt={t.author_name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {t.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-zinc-100">{t.author_name}</p>
                    {t.author_title && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{t.author_title}</p>
                    )}
                  </div>
                </div>

                <blockquote className="mt-3 border-l-2 border-gray-200 pl-3 text-sm italic text-gray-600 dark:border-zinc-700 dark:text-zinc-400">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => toggleFeatured(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  t.featured
                    ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {t.featured ? "Remover destaque" : "Destacar"}
              </button>
              <button
                onClick={() => openEdit(t)}
                className="rounded-lg bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                disabled={isPending}
                className="rounded-lg bg-red-50 p-1.5 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length > 0 && (
        <p className="mt-4 text-center text-xs text-gray-400 dark:text-zinc-500">
          {testimonials.length} depoimento{testimonials.length !== 1 ? "s" : ""} · exibidos em ordem de adição
        </p>
      )}
    </div>
  );
}
