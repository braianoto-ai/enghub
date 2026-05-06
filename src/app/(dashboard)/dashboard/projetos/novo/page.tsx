"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { engineeringAreaLabels } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import Image from "next/image";

const MAX_IMAGES = 8;

interface PreviewFile {
  file: File;
  preview: string;
}

export default function NovoProjeto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<PreviewFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!tenant) {
      setError("Tenant não encontrado.");
      setLoading(false);
      return;
    }

    // Upload all images in order
    const uploadedUrls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const { file } = images[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("project-images")
        .upload(path, file, { upsert: true });

      if (uploadErr) {
        setError("Erro ao fazer upload da imagem " + (i + 1) + ": " + uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    const formData = new FormData(form);
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .insert({
        tenant_id: tenant.id,
        title: formData.get("title"),
        description: formData.get("description"),
        area: formData.get("area"),
        location: formData.get("location"),
        client: formData.get("client"),
        status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
        image_url: uploadedUrls[0] ?? null,
      })
      .select("id")
      .single();

    if (projectErr) {
      setError("Erro ao criar projeto: " + projectErr.message);
      setLoading(false);
      return;
    }

    // Insert all images into project_images
    if (uploadedUrls.length > 0) {
      await supabase.from("project_images").insert(
        uploadedUrls.map((url, position) => ({
          project_id: project.id,
          url,
          position,
        }))
      );
    }

    router.push("/dashboard/projetos");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/projetos">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Projeto</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Imagens{" "}
              <span className="text-sm font-normal text-gray-400">
                ({images.length}/{MAX_IMAGES})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Previews grid */}
            {images.length > 0 && (
              <div className="mb-3 grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <Image
                      src={img.preview}
                      alt={`Imagem ${i + 1}`}
                      fill
                      className="rounded-lg object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-violet-600 px-1 py-0.5 text-[10px] font-semibold text-white">
                        Capa
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-violet-400 hover:text-violet-500"
              >
                <ImagePlus size={24} />
                <span className="text-sm">
                  {images.length === 0
                    ? "Adicionar imagens (máx. 8)"
                    : `Adicionar mais (${MAX_IMAGES - images.length} restantes)`}
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleImagesChange}
            />
            <p className="mt-2 text-xs text-gray-400">
              A primeira imagem será a capa do projeto. PNG, JPG ou WEBP.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              name="title"
              label="Título"
              placeholder="Ex: Projeto Residencial Alphaville"
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Área
              </label>
              <select
                name="area"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                required
              >
                <option value="">Selecione a área</option>
                {Object.entries(engineeringAreaLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                name="description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                rows={4}
                placeholder="Descreva o projeto..."
              />
            </div>
            <Input
              id="location"
              name="location"
              label="Localização"
              placeholder="São Paulo, SP"
            />
            <Input
              id="client"
              name="client"
              label="Cliente"
              placeholder="Nome do cliente (opcional)"
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="publish" className="rounded" />
              Publicar imediatamente
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/projetos">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button disabled={loading}>
            {loading ? "Salvando..." : "Salvar Projeto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
