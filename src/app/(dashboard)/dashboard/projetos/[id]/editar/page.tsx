"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { engineeringAreaLabels } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

const MAX_IMAGES = 8;

interface ExistingImage {
  id: string;
  url: string;
  position: number;
}

interface NewImage {
  file: File;
  preview: string;
}

export default function EditarProjeto() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("DRAFT");

  // Images
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + newImages.length;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: project } = await supabase
        .from("projects")
        .select("title, area, description, location, client, status, image_url, project_images(id, url, position)")
        .eq("id", projectId)
        .maybeSingle();

      if (!project) {
        router.push("/dashboard/projetos");
        return;
      }

      setTitle(project.title ?? "");
      setArea(project.area ?? "");
      setDescription(project.description ?? "");
      setLocation(project.location ?? "");
      setClient((project as { client?: string | null }).client ?? "");
      setStatus(project.status ?? "DRAFT");

      const imgs = (project.project_images as ExistingImage[] | null) ?? [];
      if (imgs.length > 0) {
        setExistingImages(imgs.sort((a, b) => a.position - b.position));
      } else if (project.image_url) {
        // legacy: single image_url with no project_images rows
        setExistingImages([{ id: "__legacy__", url: project.image_url, position: 0 }]);
      }

      setFetching(false);
    }
    load();
  }, [projectId, router]);

  function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - totalImages;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeExisting(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    if (id !== "__legacy__") setRemovedImageIds((prev) => [...prev, id]);
  }

  function removeNew(index: number) {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Upload new images
    const uploadedUrls: string[] = [];
    for (let i = 0; i < newImages.length; i++) {
      const { file } = newImages[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("project-images")
        .upload(path, file, { upsert: true });
      if (uploadErr) {
        setError("Erro no upload da imagem " + (i + 1));
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }

    // Delete removed existing images
    if (removedImageIds.length > 0) {
      await supabase.from("project_images").delete().in("id", removedImageIds);
    }

    // Insert new project_images rows
    const startPosition = existingImages.length;
    if (uploadedUrls.length > 0) {
      await supabase.from("project_images").insert(
        uploadedUrls.map((url, i) => ({
          project_id: projectId,
          url,
          position: startPosition + i,
        }))
      );
    }

    // Determine new cover image
    const allImages = [
      ...existingImages.map((img) => img.url),
      ...uploadedUrls,
    ];
    const coverUrl = allImages[0] ?? null;

    // Update project
    const { error: updateErr } = await supabase
      .from("projects")
      .update({
        title,
        area,
        description: description || null,
        location: location || null,
        client: client || null,
        status,
        image_url: coverUrl,
      })
      .eq("id", projectId);

    if (updateErr) {
      setError("Erro ao salvar: " + updateErr.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/projetos");
    router.refresh();
  }

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard/projetos">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Projeto</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Imagens{" "}
              <span className="text-sm font-normal text-gray-400">
                ({totalImages}/{MAX_IMAGES})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalImages > 0 && (
              <div className="mb-3 grid grid-cols-4 gap-2">
                {existingImages.map((img, i) => (
                  <div key={img.id} className="relative aspect-square">
                    <Image src={img.url} alt={`Imagem ${i + 1}`} fill className="rounded-lg object-cover" />
                    {i === 0 && existingImages.length + newImages.length > 0 && (
                      <span className="absolute left-1 top-1 rounded bg-violet-600 px-1 py-0.5 text-[10px] font-semibold text-white">Capa</span>
                    )}
                    <button type="button" onClick={() => removeExisting(img.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {newImages.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <Image src={img.preview} alt={`Nova ${i + 1}`} fill className="rounded-lg object-cover" />
                    {existingImages.length === 0 && i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-violet-600 px-1 py-0.5 text-[10px] font-semibold text-white">Capa</span>
                    )}
                    <button type="button" onClick={() => removeNew(i)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {totalImages < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-violet-400 hover:text-violet-500"
              >
                <ImagePlus size={24} />
                <span className="text-sm">
                  {totalImages === 0 ? "Adicionar imagens" : `Adicionar mais (${MAX_IMAGES - totalImages} restantes)`}
                </span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={handleNewImages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informações do Projeto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input id="title" label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" required>
                <option value="">Selecione a área</option>
                {Object.entries(engineeringAreaLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" rows={4} />
            </div>
            <Input id="location" label="Localização" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input id="client" label="Cliente" value={client} onChange={(e) => setClient(e.target.value)} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/projetos"><Button variant="outline">Cancelar</Button></Link>
          <Button disabled={loading}>{loading ? "Salvando..." : "Salvar Alterações"}</Button>
        </div>
      </form>
    </div>
  );
}
