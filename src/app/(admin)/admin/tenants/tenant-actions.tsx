"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MoreVertical, Ban, CheckCircle, CreditCard, Star } from "lucide-react";

interface TenantActionsProps {
  tenantId: string;
  currentStatus: string;
  currentPlan: string;
  featured: boolean;
}

const plans = ["FREE", "PRO", "EMPRESA", "PREMIUM"];

export function TenantActions({ tenantId, currentStatus, currentPlan, featured }: TenantActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleStatus() {
    setLoading(true);
    const supabase = createClient();
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await supabase.from("tenants").update({ status: newStatus }).eq("id", tenantId);
    setOpen(false);
    router.refresh();
    setLoading(false);
  }

  async function changePlan(plan: string) {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("tenants").update({ plan }).eq("id", tenantId);
    setOpen(false);
    router.refresh();
    setLoading(false);
  }

  async function toggleFeatured() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("tenants").update({ featured: !featured }).eq("id", tenantId);
    setOpen(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        disabled={loading}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-10 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-xs font-medium text-gray-400 uppercase">Plano</p>
          </div>
          {plans.map((plan) => (
            <button
              key={plan}
              onClick={() => changePlan(plan)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${plan === currentPlan ? "font-semibold text-blue-600" : "text-gray-700"}`}
            >
              <CreditCard size={14} />
              {plan}
              {plan === currentPlan && " ✓"}
            </button>
          ))}
          <div className="border-t border-gray-100">
            <button
              onClick={toggleFeatured}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${featured ? "text-yellow-600 hover:bg-yellow-50" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <Star size={14} className={featured ? "fill-yellow-500 text-yellow-500" : ""} />
              {featured ? "Remover destaque" : "Marcar destaque"}
            </button>
            <button
              onClick={toggleStatus}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${currentStatus === "ACTIVE" ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
            >
              {currentStatus === "ACTIVE" ? <Ban size={14} /> : <CheckCircle size={14} />}
              {currentStatus === "ACTIVE" ? "Suspender" : "Reativar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
