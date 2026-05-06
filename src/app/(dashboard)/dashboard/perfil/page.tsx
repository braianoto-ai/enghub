import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PerfilForm } from "./perfil-form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, description, logo")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("tenant_id", tenant?.id ?? "")
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      <p className="mt-1 text-gray-500">Gerencie suas informações profissionais</p>
      <PerfilForm tenant={tenant} profile={profile} />
    </div>
  );
}
