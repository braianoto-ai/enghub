import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgendaClient } from "./agenda-client";

export default async function AgendaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/dashboard");

  const [{ data: slots }, { data: appointments }] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("id, day_of_week, start_time, end_time, is_active")
      .eq("tenant_id", tenant.id)
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("appointments")
      .select("id, client_name, client_email, client_phone, scheduled_at, duration_minutes, notes, status, created_at")
      .eq("tenant_id", tenant.id)
      .gte("scheduled_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(50),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Agenda</h1>
      <p className="mt-1 text-gray-500 dark:text-zinc-400">
        Configure seus horários disponíveis e gerencie agendamentos
      </p>
      <AgendaClient
        tenantId={tenant.id}
        tenantSlug={tenant.slug}
        slots={slots ?? []}
        appointments={appointments ?? []}
      />
    </div>
  );
}
