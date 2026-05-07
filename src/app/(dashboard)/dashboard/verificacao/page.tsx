import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VerificacaoClient } from "./verificacao-client";

export default async function VerificacaoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("professional_profiles")
    .select("crea_cau_verified, crea_cau_status, crea_cau_number, crea_cau_type, crea_cau_notes, crea, cau")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Verificação CREA/CAU</h1>
      <p className="mt-1 text-gray-500 dark:text-zinc-400">
        Tenha seu registro profissional verificado e exiba o selo no seu perfil.
      </p>
      <VerificacaoClient
        tenantId={tenant.id}
        status={(profile?.crea_cau_status as string) ?? "NONE"}
        verified={profile?.crea_cau_verified ?? false}
        number={profile?.crea_cau_number ?? null}
        type={(profile?.crea_cau_type as string) ?? null}
        notes={profile?.crea_cau_notes ?? null}
        existingCrea={profile?.crea ?? null}
        existingCau={profile?.cau ?? null}
      />
    </div>
  );
}
