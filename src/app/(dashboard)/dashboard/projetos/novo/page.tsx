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

export default function NovoProjeto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("project-images")
        .upload(path, imageFile, { upsert: true });

      if (uploadErr) {
        setError("Erro ao fazer upload da imagem: " + uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const formData = new FormData(form);
    const { error: err } = await supabase.from("projects").insert({
      tenant_id: tenant.id,
      title: formData.get("title"),
      description: formData.get("description"),
      area: formData.get("area"),
      location: formData.get("location"),
      client: formData.get("client"),
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      image_url: imageUrl,
    });

    if (err) {
      setError("Erro ao criar projeto: " + err.message);
    } else {
      router.push("/dashboard/projetos");
      router.refresh();
    }
    setLoading(false);
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

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 max-w-2xl">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        <Card>
          <CardHeader><CardTitle>Imagem de Capa</CardTitle></CardHeader>
          <CardContent>
            {preview ? (
              <div className="relative">
                <Image
                  src={preview}
                  alt="Preview"
                  width={640}
                  height={256}
                  className="h-48 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <ImagePlus size={32} />
                <span className="text-sm">Clique para adicionar uma imagem</span>
                <span className="text-xs">PNG, JPG, WEBP até 5MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informações do Projeto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input id="title" name="title" label="Título" placeholder="Ex: Projeto Residencial Alphaville" required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <select name="area" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" required>
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Descreva o projeto..."
              />
            </div>
            <Input id="location" name="location" label="Localização" placeholder="São Paulo, SP" />
            <Input id="client" name="client" label="Cliente" placeholder="Nome do cliente (opcional)" />
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="publish" className="rounded" />
              Publicar imediatamente
            </label>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/projetos">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button disabled={loading}>{loading ? "Salvando..." : "Salvar Projeto"}</Button>
        </div>
      </form>
    </div>
  );
}
