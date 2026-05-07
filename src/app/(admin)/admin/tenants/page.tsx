import { createClient } from "@/lib/supabase/server";
import { TenantsAdminClient } from "./tenants-admin-client";

export default async function TenantsPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, slug, plan, status, featured, created_at, trial_ends_at, owner:profiles(name, email)")
    .order("created_at", { ascending: false });

  const now = new Date();

  const flat = (tenants ?? []).map((t) => {
    const owner = t.owner as unknown as { name: string; email: string } | null;
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      plan: t.plan,
      status: t.status,
      featured: t.featured ?? false,
      created_at: t.created_at,
      trial_ends_at: t.trial_ends_at ?? null,
      is_on_trial: !!(t.trial_ends_at && new Date(t.trial_ends_at) > now),
      owner_name: owner?.name ?? null,
      owner_email: owner?.email ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Perfis / Tenants</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {flat.length} perfil{flat.length !== 1 ? "is" : ""} cadastrado{flat.length !== 1 ? "s" : ""}
        </p>
      </div>
      <TenantsAdminClient tenants={flat} />
    </div>
  );
}
