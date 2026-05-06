"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Upload, Trash2, Check, ExternalLink, Loader2 } from "lucide-react";

interface CurriculumUploadProps {
  tenantId: string;
  currentUrl?: string | null;
}

export function CurriculumUpload({ tenantId, currentUrl }: CurriculumUploadProps) {
  const [url, setUrl] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são permitidos.");
      return;
    }

    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`O arquivo deve ter no máximo ${maxMB}MB.`);
      return;
    }

    setError("");
    setUploading(true);
    setSuccess(false);

    const supabase = createClient();
    const path = `curriculos/${tenantId}/curriculo.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from("project-images")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });

    if (uploadErr) {
      setError("Erro ao fazer upload: " + uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    const { error: dbErr } = await supabase
      .from("professional_profiles")
      .update({ curriculum_url: publicUrl })
      .eq("tenant_id", tenantId);

    if (dbErr) {
      setError("Erro ao salvar: " + dbErr.message);
    } else {
      setUrl(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove() {
    if (!confirm("Remover currículo do perfil?")) return;
    setRemoving(true);

    const supabase = createClient();
    const path = `curriculos/${tenantId}/curriculo.pdf`;

    await supabase.storage.from("project-images").remove([path]);
    await supabase
      .from("professional_profiles")
      .update({ curriculum_url: null })
      .eq("tenant_id", tenantId);

    setUrl(null);
    setRemoving(false);
  }

  return (
    <div className="space-y-3">
      {url ? (
        /* Currículo já enviado */
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800/50 dark:bg-green-900/20">
          <div className="flex items-center gap-3">
            <FileText size={20} className="shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Currículo enviado
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                Aparece como botão no seu perfil público
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/40"
            >
              <ExternalLink size={12} />
              Ver PDF
            </a>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {removing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Remover
            </button>
          </div>
        </div>
      ) : (
        /* Upload area */
        <label
          htmlFor="curriculum-upload"
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
            uploading
              ? "border-gray-400 bg-gray-100 dark:border-gray-600 dark:bg-gray-800/10"
              : "border-zinc-300 bg-zinc-50 hover:border-gray-400 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-gray-500 dark:hover:bg-gray-800/10"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-gray-500" />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
                Enviando...
              </p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Upload size={22} className="text-zinc-500 dark:text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Clique para enviar seu currículo em PDF
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  PDF · máximo 5MB
                </p>
              </div>
            </>
          )}
        </label>
      )}

      <input
        ref={inputRef}
        id="curriculum-upload"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check size={15} />
          Currículo publicado no seu perfil!
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
