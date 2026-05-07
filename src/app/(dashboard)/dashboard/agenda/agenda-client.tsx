"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAYS_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const STATUS_CONFIG = {
  PENDING:   { label: "Pendente",   color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  CONFIRMED: { label: "Confirmado", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelado",  color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  COMPLETED: { label: "Concluído",  color: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
  status: string;
  created_at: string;
}

interface Props {
  tenantId: string;
  tenantSlug: string;
  slots: Slot[];
  appointments: Appointment[];
}

export function AgendaClient({ tenantId, tenantSlug, slots, appointments }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<"disponibilidade" | "agendamentos">("disponibilidade");

  // ── Slots state ──
  const [slotList, setSlotList] = useState<Slot[]>(slots);
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [savingSlot, setSavingSlot] = useState(false);

  // ── Appointments state ──
  const [apptList, setApptList] = useState<Appointment[]>(appointments);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Group slots by day
  const slotsByDay = DAYS.reduce<Record<number, Slot[]>>((acc, _, i) => {
    acc[i] = slotList.filter((s) => s.day_of_week === i);
    return acc;
  }, {});

  async function addSlot() {
    if (!addingDay && addingDay !== 0) return;
    if (newStart >= newEnd) return;
    setSavingSlot(true);

    const { data, error } = await supabase
      .from("availability_slots")
      .insert({
        tenant_id: tenantId,
        day_of_week: addingDay,
        start_time: newStart,
        end_time: newEnd,
        is_active: true,
      })
      .select("id, day_of_week, start_time, end_time, is_active")
      .single();

    if (!error && data) {
      setSlotList((prev) => [...prev, data as Slot]);
    }
    setAddingDay(null);
    setNewStart("09:00");
    setNewEnd("10:00");
    setSavingSlot(false);
  }

  async function deleteSlot(slotId: string) {
    await supabase.from("availability_slots").delete().eq("id", slotId);
    setSlotList((prev) => prev.filter((s) => s.id !== slotId));
  }

  async function toggleSlot(slotId: string, current: boolean) {
    await supabase
      .from("availability_slots")
      .update({ is_active: !current })
      .eq("id", slotId);
    setSlotList((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, is_active: !current } : s))
    );
  }

  async function updateApptStatus(apptId: string, status: string) {
    setUpdatingId(apptId);
    await supabase.from("appointments").update({ status }).eq("id", apptId);
    setApptList((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status } : a))
    );
    setUpdatingId(null);

    // Notify client via system notification (best-effort)
    const appt = apptList.find((a) => a.id === apptId);
    if (appt) {
      await supabase.from("notifications").insert({
        tenant_id: tenantId,
        type: "system",
        title: status === "CONFIRMED"
          ? `Agendamento confirmado com ${appt.client_name}`
          : `Agendamento cancelado com ${appt.client_name}`,
        body: new Date(appt.scheduled_at).toLocaleString("pt-BR"),
        href: "/dashboard/agenda",
        read: false,
      });
    }
  }

  const upcoming = apptList.filter(
    (a) => new Date(a.scheduled_at) >= new Date() && a.status !== "CANCELLED"
  );
  const past = apptList.filter(
    (a) => new Date(a.scheduled_at) < new Date() || a.status === "CANCELLED"
  );

  return (
    <div className="mt-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 w-fit">
        {(["disponibilidade", "agendamentos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-gray-700 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t === "disponibilidade" ? "Disponibilidade" : `Agendamentos ${upcoming.length > 0 ? `(${upcoming.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* Share link */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <Calendar size={15} className="shrink-0 text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-zinc-400">
          Link de agendamento público:
        </span>
        <Link
          href={`/${tenantSlug}/agendar`}
          target="_blank"
          className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:underline dark:text-gray-400"
        >
          enghub.com.br/{tenantSlug}/agendar
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* ── TAB: DISPONIBILIDADE ── */}
      {tab === "disponibilidade" && (
        <div className="mt-6 space-y-3">
          {DAYS.map((day, i) => {
            const daySlots = slotsByDay[i] ?? [];
            const isAdding = addingDay === i;

            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <span className="w-28 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    {DAYS_FULL[i]}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 flex-1 mx-4">
                    {daySlots.length === 0 ? (
                      <span className="text-xs text-gray-400 dark:text-zinc-500">Sem horários</span>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-opacity ${
                            slot.is_active
                              ? "border-gray-300 bg-gray-50 text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              : "border-dashed border-gray-200 text-gray-400 opacity-60 dark:border-zinc-700 dark:text-zinc-500"
                          }`}
                        >
                          <Clock size={11} />
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                          <button
                            onClick={() => toggleSlot(slot.id, slot.is_active)}
                            className="ml-1 opacity-60 hover:opacity-100"
                            title={slot.is_active ? "Desativar" : "Ativar"}
                          >
                            {slot.is_active ? <CheckCircle2 size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-gray-400" />}
                          </button>
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="opacity-40 hover:opacity-100 hover:text-red-500"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setAddingDay(isAdding ? null : i)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <Plus size={13} />
                    Horário
                  </button>
                </div>

                {isAdding && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Das</label>
                      <input
                        type="time"
                        value={newStart}
                        onChange={(e) => setNewStart(e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">às</label>
                      <input
                        type="time"
                        value={newEnd}
                        onChange={(e) => setNewEnd(e.target.value)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    {newStart >= newEnd && (
                      <span className="text-xs text-red-500">Horário inválido</span>
                    )}
                    <button
                      onClick={addSlot}
                      disabled={savingSlot || newStart >= newEnd}
                      className="ml-auto flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
                    >
                      {savingSlot ? "..." : <><CheckCircle2 size={12} /> Salvar</>}
                    </button>
                    <button
                      onClick={() => setAddingDay(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: AGENDAMENTOS ── */}
      {tab === "agendamentos" && (
        <div className="mt-6 space-y-6">
          {/* Upcoming */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
              Próximos ({upcoming.length})
            </h3>
            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center dark:border-zinc-700">
                <Calendar size={28} className="mx-auto mb-2 text-gray-300 dark:text-zinc-600" />
                <p className="text-sm text-gray-400 dark:text-zinc-500">Nenhum agendamento próximo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    isUpdating={updatingId === appt.id}
                    onUpdate={updateApptStatus}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
                Histórico ({past.length})
              </h3>
              <div className="space-y-2">
                {past.slice(0, 10).map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    isUpdating={updatingId === appt.id}
                    onUpdate={updateApptStatus}
                    compact
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({
  appt,
  isUpdating,
  onUpdate,
  compact = false,
}: {
  appt: Appointment;
  isUpdating: boolean;
  onUpdate: (id: string, status: string) => void;
  compact?: boolean;
}) {
  const cfg = STATUS_CONFIG[appt.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const date = new Date(appt.scheduled_at);
  const isPast = date < new Date();

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800">
            <User size={18} className="text-gray-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-zinc-100">{appt.client_name}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">{appt.client_email}</p>
            {appt.client_phone && (
              <p className="text-xs text-gray-400 dark:text-zinc-500">{appt.client_phone}</p>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
            {date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
          </p>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            {" "}· {appt.duration_minutes} min
          </p>
        </div>
      </div>

      {appt.notes && !compact && (
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
          {appt.notes}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
          {cfg.label}
        </span>

        {!isPast && appt.status === "PENDING" && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(appt.id, "CONFIRMED")}
              disabled={isUpdating}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50"
            >
              <CheckCircle2 size={12} />
              {isUpdating ? "..." : "Confirmar"}
            </button>
            <button
              onClick={() => onUpdate(appt.id, "CANCELLED")}
              disabled={isUpdating}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <XCircle size={12} />
              Cancelar
            </button>
          </div>
        )}

        {!isPast && appt.status === "CONFIRMED" && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(appt.id, "COMPLETED")}
              disabled={isUpdating}
              className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
            >
              <CheckCircle2 size={12} />
              {isUpdating ? "..." : "Concluir"}
            </button>
            <button
              onClick={() => onUpdate(appt.id, "CANCELLED")}
              disabled={isUpdating}
              className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <XCircle size={12} />
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
