import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DepoimentosClient } from "./depoimentos-client";

export default async function DepoimentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, author_name, author_title, content, avatar_url, featured, position")
    .eq("tenant_id", tenant?.id ?? "")
    .order("featured", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <DepoimentosClient
      tenantId={tenant?.id ?? ""}
      initialTestimonials={testimonials ?? []}
    />
  );
}
