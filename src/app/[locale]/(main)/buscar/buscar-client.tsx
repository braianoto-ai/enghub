"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Search, MapPin, Star, Briefcase, Users, Sparkles,
  SlidersHorizontal, X, ChevronDown, ShieldCheck,
  GitCompareArrows, ArrowRight, CheckCircle,
} from "lucide-react";
import { engineeringAreaLabels } from "@/lib/utils";

interface Professional {
  id: string;
  name: string;
  slug: string;
  featured: boolean;
  bio: string | null;
  areas: string[];
  city: string | null;
  state: string | null;
  years_experience: number | null;
  avgRating: number;
  reviewCount: number;
  avatar_url: string | null;
  verified: boolean;
}

interface BuscarClientProps {
  professionals: Professional[];
  initialSearch?: string;
  initialArea?: string;
}

type SortOption = "relevancia" | "avaliacao" | "experiencia";
type MinRating = 0 | 3 | 4 | 4.5;
type MinExp = 0 | 5 | 10 | 15;

const MAX_COMPARE = 3;

const MIN_RATING_LABELS: Record<string, string> = {
  "0": "Qualquer avaliação",
  "3": "3+ estrelas",
  "4": "4+ estrelas",
  "4.5": "4.5+ estrelas",
};

const MIN_EXP_LABELS: Record<string, string> = {
  "0": "Qualquer experiência",
  "5": "5+ anos",
  "10": "10+ anos",
  "15": "15+ anos",
};

export function BuscarClient({ professionals, initialSearch = "", initialArea = "" }: BuscarClientProps) {
  const t = useTranslations("search");

  const ALL_AREAS = t("all_areas");
  const ALL_STATES = t("all_states");

  const SORT_LABELS: Record<SortOption, string> = {
    relevancia: t("sort_relevance"),
    avaliacao: t("sort_rating"),
    experiencia: t("sort_experience"),
  };

  const [search, setSearch] = useState(initialSearch);
  const [selectedArea, setSelectedArea] = useState(initialArea || ALL_AREAS);
  const [selectedState, setSelectedState] = useState(ALL_STATES);
  const [sort, setSort] = useState<SortOption>("relevancia");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minRating, setMinRating] = useState<MinRating>(0);
  const [minExp, setMinExp] = useState<MinExp>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const areas = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => p.areas.forEach((a) => set.add(a)));
    return [ALL_AREAS, ...Array.from(set).sort()];
  }, [professionals, ALL_AREAS]);

  const states = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => { if (p.state) set.add(p.state); });
    return [ALL_STATES, ...Array.from(set).sort()];
  }, [professionals, ALL_STATES]);

  const activeFilterCount = [
    selectedArea !== ALL_AREAS,
    selectedState !== ALL_STATES,
    sort !== "relevancia",
    onlyVerified,
    minRating > 0,
    minExp > 0,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let results = professionals.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.bio ?? "").toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q) ||
        p.areas.some((a) => a.toLowerCase().includes(q));
      const matchArea = selectedArea === ALL_AREAS || p.areas.includes(selectedArea);
      const matchState = selectedState === ALL_STATES || p.state === selectedState;
      const matchVerified = !onlyVerified || p.verified;
      const matchRating = minRating === 0 || p.avgRating >= minRating;
      const matchExp = minExp === 0 || (p.years_experience ?? 0) >= minExp;
      return matchSearch && matchArea && matchState && matchVerified && matchRating && matchExp;
    });

    if (sort === "avaliacao") {
      results = [...results].sort((a, b) => {
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.reviewCount - a.reviewCount;
      });
    } else if (sort === "experiencia") {
      results = [...results].sort((a, b) => (b.years_experience ?? 0) - (a.years_experience ?? 0));
    } else {
      results = [...results].sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return results;
  }, [professionals, search, selectedArea, selectedState, sort, onlyVerified, minRating, minExp, ALL_AREAS, ALL_STATES]);

  function clearFilters() {
    setSelectedArea(ALL_AREAS);
    setSelectedState(ALL_STATES);
    setSort("relevancia");
    setOnlyVerified(false);
    setMinRating(0);
    setMinExp(0);
    setSearch("");
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  const compareList = professionals.filter((p) => compareIds.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">
            {t("subtitle", { count: professionals.length })}
          </p>
        </div>
        {compareIds.length >= 2 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="hidden items-center gap-2 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-600 sm:flex"
          >
            <GitCompareArrows size={16} />
            Comparar {compareIds.length}
          </button>
        )}
      </div>

      {/* Search bar + filter toggle */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-gray-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors ${
            showFilters || activeFilterCount > 0
              ? "border-gray-500 bg-gray-100 text-gray-800 dark:border-gray-500 dark:bg-gray-800/20 dark:text-gray-400"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <SlidersHorizontal size={15} />
          {t("filters_btn")}
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                {t("specialty")}
              </label>
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                {t("state")}
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                {t("sort_by")}
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                Avaliação mínima
              </label>
              <div className="relative">
                <select
                  value={String(minRating)}
                  onChange={(e) => setMinRating(Number(e.target.value) as MinRating)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {Object.entries(MIN_RATING_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                Experiência mínima
              </label>
              <div className="relative">
                <select
                  value={String(minExp)}
                  onChange={(e) => setMinExp(Number(e.target.value) as MinExp)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {Object.entries(MIN_EXP_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setOnlyVerified((v) => !v)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  onlyVerified
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Somente verificados
                </span>
                <div className={`h-4 w-4 rounded-sm border-2 flex items-center justify-center transition-colors ${
                  onlyVerified ? "border-green-500 bg-green-500" : "border-gray-300 dark:border-zinc-600"
                }`}>
                  {onlyVerified && <X size={10} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <X size={12} />
              {t("clear_filters")}
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {selectedArea !== ALL_AREAS && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              {selectedArea}
              <button onClick={() => setSelectedArea(ALL_AREAS)} className="ml-0.5 hover:text-gray-900"><X size={11} /></button>
            </span>
          )}
          {selectedState !== ALL_STATES && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              {selectedState}
              <button onClick={() => setSelectedState(ALL_STATES)} className="ml-0.5 hover:text-gray-900"><X size={11} /></button>
            </span>
          )}
          {sort !== "relevancia" && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              {SORT_LABELS[sort]}
              <button onClick={() => setSort("relevancia")} className="ml-0.5 hover:text-gray-900"><X size={11} /></button>
            </span>
          )}
          {onlyVerified && (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <ShieldCheck size={11} /> Verificados
              <button onClick={() => setOnlyVerified(false)} className="ml-0.5 hover:text-green-900"><X size={11} /></button>
            </span>
          )}
          {minRating > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
              <Star size={11} className="fill-yellow-400 text-yellow-400" /> {MIN_RATING_LABELS[String(minRating)]}
              <button onClick={() => setMinRating(0)} className="ml-0.5 hover:text-yellow-900"><X size={11} /></button>
            </span>
          )}
          {minExp > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              <Briefcase size={11} /> {MIN_EXP_LABELS[String(minExp)]}
              <button onClick={() => setMinExp(0)} className="ml-0.5 hover:text-gray-900"><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* Compare hint */}
      {filtered.length > 1 && compareIds.length === 0 && (
        <p className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
          <GitCompareArrows size={13} />
          Dica: clique em &ldquo;Comparar&rdquo; nos cards para comparar até 3 profissionais lado a lado.
        </p>
      )}

      {/* Results count */}
      <p className="mb-4 text-sm text-gray-500 dark:text-zinc-400">
        {filtered.length === professionals.length
          ? t("results_count", { count: filtered.length })
          : t("results_filtered", { filtered: filtered.length, total: professionals.length })}
      </p>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-zinc-700">
          <Users size={40} className="mx-auto mb-3 text-gray-300 dark:text-zinc-600" />
          <p className="text-gray-500 dark:text-zinc-400">{t("no_results")}</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">{t("no_results_tip")}</p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              {t("clear_filters")}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProfessionalCard
              key={p.id}
              professional={p}
              isSelected={compareIds.includes(p.id)}
              canCompare={compareIds.length < MAX_COMPARE || compareIds.includes(p.id)}
              onToggleCompare={() => toggleCompare(p.id)}
            />
          ))}
        </div>
      )}

      {/* Floating compare bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-2">
              {compareList.map((p) => {
                const initials = p.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                return (
                  <div key={p.id} className="relative">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-xs font-bold text-white flex items-center justify-center">
                      {p.avatar_url
                        ? <Image src={p.avatar_url} alt={p.name} fill className="object-cover" />
                        : initials}
                    </div>
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-700"
                    >
                      <X size={8} />
                    </button>
                  </div>
                );
              })}
              {Array.from({ length: MAX_COMPARE - compareList.length }).map((_, i) => (
                <div key={i} className="h-9 w-9 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-600" />
              ))}
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-600" />
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {compareIds.length} selecionado{compareIds.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-zinc-400">
                {compareIds.length < 2 ? "Selecione mais 1" : "Pronto para comparar"}
              </p>
            </div>
            <button
              disabled={compareIds.length < 2}
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <GitCompareArrows size={15} />
              Comparar
            </button>
            <button
              onClick={() => setCompareIds([])}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <GitCompareArrows size={20} className="text-zinc-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Comparação de Profissionais
              </h2>
            </div>
            <button
              onClick={() => setShowCompareModal(false)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 overflow-auto p-6">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `180px repeat(${compareList.length}, 1fr)` }}
            >
              {/* Header row: labels col + professional cols */}
              <div /> {/* empty top-left cell */}
              {compareList.map((p) => {
                const initials = p.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                return (
                  <div key={p.id} className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-lg font-bold text-white flex items-center justify-center">
                      {p.avatar_url
                        ? <Image src={p.avatar_url} alt={p.name} fill className="object-cover" />
                        : initials}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</p>
                      {p.verified && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:border-green-800/40 dark:bg-green-900/30 dark:text-green-400">
                          <ShieldCheck size={10} /> Verificado
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/${p.slug}`}
                      className="mt-1 flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600"
                    >
                      Ver perfil <ArrowRight size={12} />
                    </Link>
                  </div>
                );
              })}

              {/* Comparison rows */}
              {[
                {
                  label: "Localização",
                  render: (p: Professional) =>
                    [p.city, p.state].filter(Boolean).join(", ") || "—",
                },
                {
                  label: "Especialidades",
                  render: (p: Professional) =>
                    p.areas.length > 0
                      ? p.areas.map((a) => engineeringAreaLabels[a] ?? a).join(", ")
                      : "—",
                },
                {
                  label: "Avaliação",
                  render: (p: Professional) => (
                    <div className="flex items-center justify-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{p.avgRating > 0 ? p.avgRating.toFixed(1) : "—"}</span>
                      {p.reviewCount > 0 && (
                        <span className="text-xs text-zinc-400">({p.reviewCount})</span>
                      )}
                    </div>
                  ),
                },
                {
                  label: "Experiência",
                  render: (p: Professional) =>
                    p.years_experience != null ? `${p.years_experience} anos` : "—",
                },
                {
                  label: "CREA/CAU",
                  render: (p: Professional) =>
                    p.verified ? (
                      <span className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle size={14} /> Verificado
                      </span>
                    ) : (
                      <span className="text-zinc-400">Não verificado</span>
                    ),
                },
                {
                  label: "Bio",
                  render: (p: Professional) =>
                    p.bio ? (
                      <p className="text-left text-xs text-zinc-500 dark:text-zinc-400 line-clamp-4">{p.bio}</p>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    ),
                },
              ].map(({ label, render }) => (
                <>
                  {/* Label cell */}
                  <div key={label} className="flex items-center">
                    <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
                  </div>
                  {/* Value cells */}
                  {compareList.map((p) => (
                    <div
                      key={`${label}-${p.id}`}
                      className="flex items-center justify-center rounded-xl border border-zinc-100 bg-white p-3 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      {render(p)}
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfessionalCard({
  professional: p,
  isSelected,
  canCompare,
  onToggleCompare,
}: {
  professional: Professional;
  isSelected: boolean;
  canCompare: boolean;
  onToggleCompare: () => void;
}) {
  const t = useTranslations("search");
  const initials = p.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`group relative flex flex-col rounded-xl border bg-white shadow-sm transition-all dark:bg-zinc-900 ${
      isSelected
        ? "border-gray-500 ring-2 ring-gray-500/30 dark:border-gray-400"
        : p.featured
        ? "border-yellow-300 ring-1 ring-yellow-200 dark:border-yellow-600/50 dark:ring-yellow-600/20"
        : "border-gray-200 dark:border-zinc-700"
    }`}>
      {/* Compare toggle */}
      <button
        onClick={onToggleCompare}
        disabled={!canCompare && !isSelected}
        title={isSelected ? "Remover da comparação" : "Adicionar à comparação"}
        className={`absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all ${
          isSelected
            ? "border-gray-500 bg-gray-700 text-white"
            : canCompare
            ? "border-gray-200 bg-white text-gray-400 opacity-0 group-hover:opacity-100 hover:border-gray-400 hover:text-gray-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            : "hidden"
        }`}
      >
        <GitCompareArrows size={9} />
        {isSelected ? "Selecionado" : "Comparar"}
      </button>

      {/* Badges (top-right) */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {p.verified && (
          <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:border-green-800/40 dark:bg-green-900/30 dark:text-green-400">
            <ShieldCheck size={10} />
            Verificado
          </span>
        )}
        {p.featured && (
          <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Sparkles size={10} className="fill-yellow-500 text-yellow-500" />
            {t("featured")}
          </span>
        )}
      </div>

      <Link href={`/${p.slug}`} className="flex flex-1 flex-col p-5 pt-8">
        <div className="flex items-start gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-sm font-bold text-white overflow-hidden">
            {p.avatar_url ? (
              <Image src={p.avatar_url} alt={p.name} fill className="object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900 group-hover:text-gray-700 dark:text-zinc-100 dark:group-hover:text-gray-400">
              {p.name}
            </p>
            {(p.city || p.state) && (
              <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500">
                <MapPin size={11} />
                {[p.city, p.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>

        {p.bio && (
          <p className="mt-3 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">{p.bio}</p>
        )}

        {p.areas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {p.areas.slice(0, 3).map((area) => (
              <span
                key={area}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800/30 dark:text-gray-400"
              >
                {engineeringAreaLabels[area] ?? area}
              </span>
            ))}
            {p.areas.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                +{p.areas.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-700/50">
          <div className="flex items-center gap-1">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              {p.avgRating > 0 ? p.avgRating.toFixed(1) : "—"}
            </span>
            {p.reviewCount > 0 && (
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                ({p.reviewCount})
              </span>
            )}
          </div>
          {p.years_experience != null && (
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500">
              <Briefcase size={12} />
              {p.years_experience} {p.years_experience !== 1 ? t("years_plural") : t("years")}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
