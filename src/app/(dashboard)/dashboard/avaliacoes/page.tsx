import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvaliacoesClient } from "./avaliacoes-client";

export default async function AvaliacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/dashboard");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_name, reviewer_email, reply, reply_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  const list = reviews ?? [];
  const avgRating = list.length > 0
    ? list.reduce((sum, r) => sum + r.rating, 0) / list.length
    : 0;

  return (
    <AvaliacoesClient
      reviews={list}
      avgRating={avgRating}
      tenantId={tenant.id}
    />
  );
}
