import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MensagensClient } from "./mensagens-client";

export default async function MensagensPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/dashboard");

  return <MensagensClient tenantId={tenant.id} />;
}
