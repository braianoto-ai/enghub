import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { TrialBanner } from "@/components/trial-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: tenantRaw } = await supabase
    .from("tenants")
    .select("id, name, slug, plan, status, trial_ends_at, professional_profiles(avatar_url)")
    .eq("owner_id", user.id)
    .maybeSingle();

  const profData = Array.isArray(tenantRaw?.professional_profiles)
    ? tenantRaw?.professional_profiles[0]
    : tenantRaw?.professional_profiles;

  const tenant = tenantRaw ? { ...tenantRaw, avatar_url: profData?.avatar_url ?? null } : null;

  const isOnTrial = !!(
    tenant?.trial_ends_at &&
    tenant.plan === "PRO" &&
    new Date(tenant.trial_ends_at) > new Date()
  );

  return (
    <div className="flex h-screen">
      <Sidebar tenant={tenant} user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-gray-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <ThemeToggle />
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 dark:bg-slate-950">
          {isOnTrial && tenant?.trial_ends_at && (
            <TrialBanner trialEndsAt={tenant.trial_ends_at} plan={tenant.plan} />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
