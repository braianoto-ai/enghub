import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReferralClient } from "./referral-client";

export default async function IndicacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, referral_code")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/dashboard");

  // Busca indicações feitas por este tenant
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referred_name, referred_email, rewarded, created_at")
    .eq("referrer_tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const rewardedCount = (referrals ?? []).filter((r) => r.rewarded).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
        Programa de Indicação
      </h1>
      <p className="mt-1 text-gray-500 dark:text-slate-400">
        Convide colegas engenheiros e ganhe 30 dias de PRO para cada indicação confirmada.
      </p>

      <ReferralClient
        tenantSlug={tenant.slug}
        referralCode={tenant.referral_code ?? tenant.slug}
        referrals={referrals ?? []}
        rewardedCount={rewardedCount}
      />
    </div>
  );
}
