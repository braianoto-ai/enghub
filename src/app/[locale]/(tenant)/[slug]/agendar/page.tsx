import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BookingClient } from "./booking-client";
import { getInitials } from "@/lib/utils";

export default async function AgendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, status")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!tenant) notFound();

  const { data: prof } = await supabase
    .from("professional_profiles")
    .select("city, state, avatar_url")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  // Load available slots (only active ones)
  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, day_of_week, start_time, end_time")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time");

  // Load existing appointments in next 30 days to block booked slots
  const now = new Date();
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { data: bookedAppts } = await supabase
    .from("appointments")
    .select("scheduled_at, duration_minutes")
    .eq("tenant_id", tenant.id)
    .in("status", ["PENDING", "CONFIRMED"])
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", in30days.toISOString());

  const initials = getInitials(tenant.name);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top nav */}
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur-md">
        <Link href={`/${slug}`} className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-700 text-xs font-bold text-white">E</span>
          <span className="hidden font-semibold text-white sm:block">EngHub</span>
        </Link>
        <ThemeToggle variant="ghost-light" />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link href={`/${slug}`} className="mb-5 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft size={15} />
            Voltar ao perfil
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 text-lg font-bold text-white overflow-hidden shadow-lg">
              {prof?.avatar_url ? (
                <Image src={prof.avatar_url} alt={tenant.name} fill className="object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{tenant.name}</h1>
              {(prof?.city || prof?.state) && (
                <p className="mt-0.5 text-sm text-zinc-400">
                  {[prof.city, prof.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Escolha um horário disponível para agendar uma reunião com {tenant.name.split(" ")[0]}.
          </p>
        </div>
      </div>

      {/* Booking */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <BookingClient
          tenantId={tenant.id}
          tenantName={tenant.name}
          tenantSlug={slug}
          slots={slots ?? []}
          bookedSlots={(bookedAppts ?? []).map((a) => ({
            scheduled_at: a.scheduled_at,
            duration_minutes: a.duration_minutes ?? 30,
          }))}
        />
      </div>
    </div>
  );
}
