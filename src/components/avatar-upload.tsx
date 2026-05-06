"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  tenantId: string;
  currentUrl?: string | null;
  name: string;
  size?: "sm" | "lg";
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function AvatarUpload({ tenantId, currentUrl, name, size = "lg" }: AvatarUploadProps) {
  const [url, setUrl] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const dim = size === "lg" ? "h-24 w-24" : "h-16 w-16";
  const iconSize = size === "lg" ? 20 : 15;
  const textSize = size === "lg" ? "text-2xl" : "text-base";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Use JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Máximo 3MB.");
      return;
    }

    setError("");
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `avatars/${tenantId}/avatar.${ext}`;
    const supabase = createClient();

    const { error: uploadErr } = await supabase.storage
      .from("project-images")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      setError("Erro no upload: " + uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    // Força recarregamento da imagem adicionando timestamp
    const publicUrl = urlData.publicUrl + "?t=" + Date.now();

    await supabase
      .from("professional_profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("tenant_id", tenantId);

    setUrl(publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove() {
    if (!confirm("Remover foto de perfil?")) return;
    const supabase = createClient();

    // Tenta remover arquivos com extensões comuns
    await Promise.all(
      ["jpg", "jpeg", "png", "webp"].map((ext) =>
        supabase.storage.from("project-images").remove([`avatars/${tenantId}/avatar.${ext}`])
      )
    );

    await supabase
      .from("professional_profiles")
      .update({ avatar_url: null })
      .eq("tenant_id", tenantId);

    setUrl(null);
  }

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className={`relative shrink-0 ${dim}`}>
        {url ? (
          <Image
            src={url}
            alt={name}
            fill
            className="rounded-2xl object-cover"
          />
        ) : (
          <div className={`flex ${dim} items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 ${textSize} font-bold text-white`}>
            {getInitials(name)}
          </div>
        )}

        {/* Overlay de upload */}
        {!uploading && (
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity hover:opacity-100"
          >
            <Camera size={iconSize} className="text-white" />
          </label>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
            <Loader2 size={iconSize} className="animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <label
          htmlFor="avatar-upload"
          className="cursor-pointer text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
        >
          {url ? "Trocar foto" : "Enviar foto de perfil"}
        </label>
        <p className="mt-0.5 text-xs text-zinc-400">JPG, PNG ou WebP · máx 3MB</p>
        {url && (
          <button
            onClick={handleRemove}
            className="mt-1 flex items-center gap-1 text-xs text-red-500 hover:underline"
          >
            <Trash2 size={11} />
            Remover foto
          </button>
        )}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <input
        ref={inputRef}
        id="avatar-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
