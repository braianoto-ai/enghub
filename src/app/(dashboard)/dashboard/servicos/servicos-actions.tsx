"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, MoreVertical, ToggleLeft, ToggleRight } from "lucide-react";

interface ServicosActionsProps {
  serviceId: string;
  isActive: boolean;
}

export function ServicosActions({ serviceId, isActive }: ServicosActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Deletar este serviço?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("services").delete().eq("id", serviceId);
    router.refresh();
  }

  async function handleToggle() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("services")
      .update({ is_active: !isActive })
      .eq("id", serviceId);
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
        <div className="absolute right-0 top-7 z-10 w-44 rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            onClick={handleToggle}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
            {isActive ? "Desativar" : "Ativar"}
          </button>
          <button
            onClick={handleDelete}
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
