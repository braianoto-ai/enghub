"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ViewTracker({ tenantId }: { tenantId: string }) {
  useEffect(() => {
    // Evita contar a mesma visita mais de uma vez por sessão
    const key = `viewed_${tenantId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const supabase = createClient();
    supabase.from("profile_views").insert({
      tenant_id: tenantId,
      page: "portfolio",
      referrer: document.referrer || null,
    });
  }, [tenantId]);

  return null;
}
