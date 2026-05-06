"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, Send, Loader2 } from "lucide-react";

interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface BookedSlot {
  scheduled_at: string;
  duration_minutes: number;
}

interface Props {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  slots: Slot[];
  bookedSlots: BookedSlot[];
}

const MONTHS_PT = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const DAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export function BookingClient({ tenantId, tenantName, slots, bookedSlots }: Props) {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Build calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  // Check if a date has available slots
  function hasSlots(date: Date): boolean {
    if (date < today) return false;
    const dow = date.getDay();
    return slots.some((s) => s.day_of_week === dow);
  }

  // Get time options for selected date
  const timeOptions = useMemo(() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    const daySlots = slots.filter((s) => s.day_of_week === dow);

    // Generate 30-min intervals from each slot
    const times: string[] = [];
    for (const slot of daySlots) {
      const [startH, startM] = slot.start_time.split(":").map(Number);
      const [endH, endM] = slot.end_time.split(":").map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;
      while (current + 30 <= end) {
        const hh = String(Math.floor(current / 60)).padStart(2, "0");
        const mm = String(current % 60).padStart(2, "0");
        times.push(`${hh}:${mm}`);
        current += 30;
      }
    }

    // Filter out booked slots
    return times.filter((time) => {
      const [h, m] = time.split(":").map(Number);
      const slotDate = new Date(selectedDate);
      slotDate.setHours(h, m, 0, 0);
      const slotEnd = new Date(slotDate.getTime() + 30 * 60 * 1000);

      // Must be in the future
      if (slotDate <= new Date()) return false;

      // Check no overlap with booked
      return !bookedSlots.some((b) => {
        const bStart = new Date(b.scheduled_at);
        const bEnd = new Date(bStart.getTime() + b.duration_minutes * 60 * 1000);
        return slotDate < bEnd && slotEnd > bStart;
      });
    });
  }, [selectedDate, slots, bookedSlots]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError("");

    const [h, m] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(h, m, 0, 0);

    const { error: err } = await supabase.from("appointments").insert({
      tenant_id: tenantId,
      client_name: name.trim(),
      client_email: email.trim(),
      client_phone: phone.trim() || null,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: 30,
      notes: notes.trim() || null,
      status: "PENDING",
    });

    if (err) {
      setError("Erro ao realizar agendamento. Tente novamente.");
      setSubmitting(false);
      return;
    }

    // Notify professional
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      type: "system",
      title: `📅 Novo agendamento de ${name.trim()}`,
      body: `${scheduledAt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às ${selectedTime}`,
      href: "/dashboard/agenda",
      read: false,
    });

    setDone(true);
    setSubmitting(false);
  }

  // ── SUCCESS ──
  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800/40 dark:bg-green-900/10">
        <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">Agendamento solicitado!</h2>
        <p className="mt-2 text-sm text-green-700 dark:text-green-500">
          {tenantName.split(" ")[0]} receberá sua solicitação e confirmará em breve.
        </p>
        {selectedDate && selectedTime && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 dark:border-green-800/40 dark:bg-zinc-900">
            <Calendar size={16} className="text-green-500" />
            <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
              {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              {" às "}
              {selectedTime}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── NO SLOTS ──
  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
        <Calendar size={36} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
        <p className="text-zinc-500 dark:text-zinc-400">
          {tenantName.split(" ")[0]} ainda não configurou horários disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Calendar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            disabled={currentMonth <= new Date(today.getFullYear(), today.getMonth(), 1)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {MONTHS_PT[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DAYS_SHORT.map((d) => (
            <div key={d} className="py-1 text-xs font-medium text-zinc-400">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const available = hasSlots(day);
            const isPast = day < today;
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            const isToday = day.toDateString() === today.toDateString();

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  if (!available || isPast) return;
                  setSelectedDate(day);
                  setSelectedTime(null);
                }}
                disabled={!available || isPast}
                className={`relative aspect-square rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-gray-700 text-white"
                    : available && !isPast
                    ? "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    : "text-zinc-300 cursor-not-allowed dark:text-zinc-600"
                } ${isToday && !isSelected ? "ring-1 ring-gray-400" : ""}`}
              >
                {day.getDate()}
                {available && !isPast && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-green-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Clock size={15} />
            Horários disponíveis em {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </h3>
          {timeOptions.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Todos os horários já estão reservados neste dia.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    selectedTime === time
                      ? "border-gray-500 bg-gray-700 text-white"
                      : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking form */}
      {selectedDate && selectedTime && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">Seus dados</h3>
          <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
            Agendamento para {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às {selectedTime}
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Nome *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">E-mail *</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Telefone / WhatsApp</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="(11) 99999-9999"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Assunto / Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Descreva brevemente o que gostaria de tratar..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {submitting ? "Agendando..." : "Confirmar agendamento"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
