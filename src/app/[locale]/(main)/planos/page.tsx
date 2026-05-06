"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Zap,
  Building2,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  Shield,
  Headphones,
  BarChart3,
  Globe,
} from "lucide-react";

export default function PlanosPage() {
  const t = useTranslations("plans");
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  const plans = [
    {
      key: "FREE",
      name: t("plan_free_name"),
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: t("plan_free_desc"),
      badge: null,
      icon: Shield,
      iconColor: "text-zinc-500",
      iconBg: "bg-zinc-100 dark:bg-zinc-800",
      features: [
        t("feat_1_profile"),
        t("feat_5_projects"),
        t("feat_3_services"),
        t("feat_basic_page"),
        t("feat_search"),
        t("feat_reviews"),
      ],
      cta: t("plan_free_cta"),
      ctaLink: "/cadastro",
      highlighted: false,
    },
    {
      key: "PRO",
      name: t("plan_pro_name"),
      monthlyPrice: 49,
      yearlyPrice: 39,
      description: t("plan_pro_desc"),
      badge: t("plan_pro_badge"),
      icon: Zap,
      iconColor: "text-gray-700",
      iconBg: "bg-gray-200 dark:bg-gray-700/40",
      features: [
        t("feat_unlimited_projects"),
        t("feat_unlimited_services"),
        t("feat_subdomain"),
        t("feat_featured"),
        t("feat_badge"),
        t("feat_stats"),
        t("feat_priority_support"),
      ],
      cta: t("plan_pro_cta"),
      ctaLink: "/cadastro",
      highlighted: true,
    },
    {
      key: "EMPRESA",
      name: t("plan_empresa_name"),
      monthlyPrice: 129,
      yearlyPrice: 99,
      description: t("plan_empresa_desc"),
      badge: null,
      icon: Building2,
      iconColor: "text-gray-600",
      iconBg: "bg-gray-200 dark:bg-gray-700/40",
      features: [
        t("feat_all_pro"),
        t("feat_team_10"),
        t("feat_company_page"),
        t("feat_domain"),
        t("feat_advanced_reports"),
        t("feat_api"),
        t("feat_whatsapp_support"),
      ],
      cta: t("plan_empresa_cta"),
      ctaLink: "/cadastro",
      highlighted: false,
    },
    {
      key: "PREMIUM",
      name: t("plan_premium_name"),
      monthlyPrice: 299,
      yearlyPrice: 239,
      description: t("plan_premium_desc"),
      badge: null,
      icon: Star,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      features: [
        t("feat_all_empresa"),
        t("feat_unlimited_members"),
        t("feat_doc_templates"),
        t("feat_crea_integration"),
        t("feat_account_manager"),
        t("feat_sla"),
        t("feat_onboarding"),
        t("feat_training"),
        t("feat_early_access"),
      ],
      cta: t("plan_premium_cta"),
      ctaLink: "mailto:contato@enghub.com.br",
      highlighted: false,
    },
  ];

  const comparisonFeatures = [
    {
      category: t("cat_portfolio"),
      rows: [
        { label: t("row_projects"), values: [t("val_up5"), t("val_unlimited"), t("val_unlimited"), t("val_unlimited")] },
        { label: t("row_services"), values: ["Até 3", t("val_unlimited"), t("val_unlimited"), t("val_unlimited")] },
        { label: t("row_gallery"), values: [true, true, true, true] },
        { label: t("row_videos"), values: [false, true, true, true] },
      ],
    },
    {
      category: t("cat_visibility"),
      rows: [
        { label: t("row_public_page"), values: [true, true, true, true] },
        { label: t("row_search"), values: [true, true, true, true] },
        { label: t("row_featured"), values: [false, true, true, true] },
        { label: t("row_verified"), values: [false, true, true, true] },
        { label: t("row_subdomain"), values: [false, true, true, true] },
        { label: t("row_domain"), values: [false, false, true, true] },
      ],
    },
    {
      category: t("cat_analytics"),
      rows: [
        { label: t("row_stats"), values: [false, true, true, true] },
        { label: t("row_reports"), values: [false, false, true, true] },
        { label: t("row_export"), values: [false, false, true, true] },
      ],
    },
    {
      category: t("cat_team"),
      rows: [
        { label: t("row_members"), values: ["—", "—", t("val_up10"), t("val_unlimited")] },
        { label: t("row_company_page"), values: [false, false, true, true] },
        { label: t("row_permissions"), values: [false, false, true, true] },
      ],
    },
    {
      category: t("cat_support"),
      rows: [
        { label: t("row_email_support"), values: [true, true, true, true] },
        { label: t("row_priority_support"), values: [false, true, true, true] },
        { label: t("row_whatsapp_support"), values: [false, false, true, true] },
        { label: t("row_account_manager"), values: [false, false, false, true] },
      ],
    },
  ];

  const faqs = [
    { question: t("faq_q1"), answer: t("faq_a1") },
    { question: t("faq_q2"), answer: t("faq_a2") },
    { question: t("faq_q3"), answer: t("faq_a3") },
    { question: t("faq_q4"), answer: t("faq_a4") },
    { question: t("faq_q5"), answer: t("faq_a5") },
    { question: t("faq_q6"), answer: t("faq_a6") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-24 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gray-700/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 translate-x-1/2 rounded-full bg-gray-1000/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-500/30 bg-gray-1000/10 px-4 py-1.5 text-sm text-gray-400">
            <Zap size={14} />
            {t("hero_badge")}
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
            {t("hero_title")}
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            {t("hero_subtitle")}
          </p>

          {/* Toggle anual/mensal */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-800/60 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !annual
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t("toggle_monthly")}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                annual
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t("toggle_annual")}
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
                −20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de planos */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  plan.highlighted
                    ? "border-gray-500 bg-gray-700 text-white shadow-xl shadow-gray-500/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-800 px-4 py-1 text-xs font-semibold text-gray-300 ring-1 ring-gray-500">
                    {plan.badge}
                  </div>
                )}

                <div className={`w-fit rounded-xl p-2 ${plan.highlighted ? "bg-white/20" : plan.iconBg}`}>
                  <Icon size={20} className={plan.highlighted ? "text-white" : plan.iconColor} />
                </div>

                <div className="mt-4">
                  <h3 className={`text-lg font-bold ${plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 text-sm ${plan.highlighted ? "text-gray-300" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6">
                  {price === 0 ? (
                    <div className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                      {t("free_label")}
                    </div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className={`text-sm ${plan.highlighted ? "text-gray-300" : "text-zinc-500"}`}>R$</span>
                      <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                        {price}
                      </span>
                      <span className={`mb-1 text-sm ${plan.highlighted ? "text-gray-300" : "text-zinc-500"}`}>
                        {t("per_month")}
                      </span>
                    </div>
                  )}
                  {annual && price > 0 && (
                    <p className={`mt-1 text-xs ${plan.highlighted ? "text-gray-300" : "text-zinc-400"}`}>
                      {t("billed_annually", { total: price * 12 })}
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-gray-300" : "text-green-500"}`}
                      />
                      <span className={`text-sm ${plan.highlighted ? "text-gray-200" : "text-zinc-600 dark:text-zinc-400"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaLink} className="mt-8 block">
                  <button
                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-white text-gray-800 hover:bg-gray-100"
                        : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Prova social */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-zinc-100 pt-12 dark:border-zinc-800">
          {[
            { icon: Shield, text: t("social_payment") },
            { icon: Zap, text: t("social_instant") },
            { icon: Headphones, text: t("social_support") },
            { icon: Users, text: t("social_community") },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Icon size={16} className="text-gray-500" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Tabela comparativa */}
      <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {t("compare_title")}
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              {t("compare_subtitle")}
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-4 pl-6 pr-4 text-left text-sm font-medium text-zinc-500">
                    {t("features_header")}
                  </th>
                  {plans.map((p) => (
                    <th key={p.key} className="px-4 py-4 text-center">
                      <span className={`text-sm font-bold ${p.highlighted ? "text-gray-700" : "text-zinc-900 dark:text-zinc-100"}`}>
                        {p.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures
                  .slice(0, showFullTable ? undefined : 2)
                  .map((category) => (
                    <>
                      <tr key={category.category} className="bg-zinc-50 dark:bg-zinc-800/50">
                        <td
                          colSpan={5}
                          className="py-2 pl-6 text-xs font-semibold uppercase tracking-wider text-zinc-400"
                        >
                          {category.category}
                        </td>
                      </tr>
                      {category.rows.map((row) => (
                        <tr
                          key={row.label}
                          className="border-t border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                        >
                          <td className="py-3 pl-6 pr-4 text-sm text-zinc-700 dark:text-zinc-300">
                            {row.label}
                          </td>
                          {row.values.map((val, i) => (
                            <td key={i} className="px-4 py-3 text-center">
                              {typeof val === "boolean" ? (
                                val ? (
                                  <Check size={16} className="mx-auto text-green-500" />
                                ) : (
                                  <X size={16} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                                )
                              ) : (
                                <span className={`text-sm font-medium ${val === "—" ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                                  {val}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
              </tbody>
            </table>

            {!showFullTable && (
              <div className="border-t border-zinc-100 p-4 text-center dark:border-zinc-800">
                <button
                  onClick={() => setShowFullTable(true)}
                  className="flex items-center gap-1 mx-auto text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  {t("show_all")}
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {t("faq_title")}
          </h2>
        </div>

        <div className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {faq.question}
                </span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="shrink-0 text-zinc-400" />
                ) : (
                  <ChevronDown size={18} className="shrink-0 text-zinc-400" />
                )}
              </button>
              {openFaq === i && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
      <div className="px-4 pb-20">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900/40 to-zinc-950 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-700">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {t("cta_title")}
          </h2>
          <p className="mt-3 text-zinc-400">
            {t("cta_subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cadastro">
              <button className="rounded-xl bg-gray-700 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-500/25 transition hover:bg-gray-600">
                {t("cta_button")}
              </button>
            </Link>
            <Link href="/buscar">
              <button className="rounded-xl border border-zinc-700 px-8 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                {t("cta_search")}
              </button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <Globe size={13} />
            {t("cta_count")}
          </div>
        </div>
      </div>
    </div>
  );
}
