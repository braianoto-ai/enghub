"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Edit, MoreVertical } from "lucide-react";

interface ProjetosActionsProps {
  projectId: string;
  tenantId: string;
}

export function ProjetosActions({ projectId, tenantId }: ProjetosActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Deletar este projeto?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", projectId);
    router.refresh();
  }

  async function handleToggleStatus(currentStatus: string) {
    setLoading(true);
    const supabase = createClient();
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        disabled={loading}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-10 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => handleDelete()}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Deletar
          </button>
        </div>
      )}
    </div>
  );
}
