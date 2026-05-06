import { createClient } from "@/lib/supabase/server";
import { VerificacoesAdminClient } from "./verificacoes-admin-client";

export default async function VerificacoesAdminPage() {
  const supabase = await createClient();

  // Fetch all pending + recently reviewed verification requests
  const { data: raw } = await supabase
    .from("professional_profiles")
    .select(`
      tenant_id,
      crea_cau_number,
      crea_cau_type,
      crea_cau_status,
      crea_cau_verified,
      crea_cau_notes,
      crea_cau_reviewed_at,
      tenants!inner(id, name, slug, owner:profiles(name, email))
    `)
    .in("crea_cau_status", ["PENDING", "APPROVED", "REJECTED"])
    .order("crea_cau_reviewed_at", { ascending: true, nullsFirst: true });

  const requests = (raw ?? []).map((r) => {
    const tenant = r.tenants as unknown as {
      id: string;
      name: string;
      slug: string;
      owner: { name: string; email: string } | null;
    };
    return {
      tenant_id: r.tenant_id,
      tenant_name: tenant?.name ?? "—",
      tenant_slug: tenant?.slug ?? "",
      owner_name: tenant?.owner?.name ?? null,
      owner_email: tenant?.owner?.email ?? null,
      crea_cau_number: r.crea_cau_number,
      crea_cau_type: r.crea_cau_type,
      crea_cau_status: r.crea_cau_status,
      crea_cau_verified: r.crea_cau_verified,
      crea_cau_notes: r.crea_cau_notes,
      crea_cau_reviewed_at: r.crea_cau_reviewed_at,
    };
  });

  const pending = requests.filter((r) => r.crea_cau_status === "PENDING");
  const reviewed = requests.filter((r) => r.crea_cau_status !== "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Verificações CREA/CAU</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          {pending.length} solicitação{pending.length !== 1 ? "ões" : ""} pendente{pending.length !== 1 ? "s" : ""}
        </p>
      </div>
      <VerificacoesAdminClient pending={pending} reviewed={reviewed} />
    </div>
  );
}
