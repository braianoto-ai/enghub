"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Search, MapPin, Star, Briefcase, Users, Sparkles, SlidersHorizontal, X, ChevronDown } from "lucide-react";

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
}

interface BuscarClientProps {
  professionals: Professional[];
  initialSearch?: string;
  initialArea?: string;
}

type SortOption = "relevancia" | "avaliacao" | "experiencia";

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
  const [showFilters, setShowFilters] = useState(false);

  const areas = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => p.areas.forEach((a) => set.add(a)));
    return [ALL_AREAS, ...Array.from(set).sort()];
  }, [professionals]);

  const states = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => { if (p.state) set.add(p.state); });
    return [ALL_STATES, ...Array.from(set).sort()];
  }, [professionals]);

  const activeFilterCount = [
    selectedArea !== ALL_AREAS,
    selectedState !== ALL_STATES,
    sort !== "relevancia",
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
      return matchSearch && matchArea && matchState;
    });

    if (sort === "avaliacao") {
      results = [...results].sort((a, b) => {
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.reviewCount - a.reviewCount;
      });
    } else if (sort === "experiencia") {
      results = [...results].sort((a, b) => (b.years_experience ?? 0) - (a.years_experience ?? 0));
    } else {
      // relevancia: featured first
      results = [...results].sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return results;
  }, [professionals, search, selectedArea, selectedState, sort]);

  function clearFilters() {
    setSelectedArea(ALL_AREAS);
    setSelectedState(ALL_STATES);
    setSort("relevancia");
    setSearch("");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-slate-400">
          {professionals.length} {t(professionals.length !== 1 ? "subtitle_other" : "subtitle_one", { count: professionals.length })}
        </p>
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
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-gray-500"
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
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
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
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Area */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-slate-400">
                {t("specialty")}
              </label>
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-slate-400">
                {t("state")}
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-slate-400">
                {t("sort_by")}
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X size={12} />
              {t("clear_filters")}
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {(selectedArea !== ALL_AREAS || selectedState !== ALL_STATES || sort !== "relevancia") && (
        <div className="mb-5 flex flex-wrap gap-2">
          {selectedArea !== ALL_AREAS && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              {selectedArea}
              <button onClick={() => setSelectedArea(ALL_AREAS)} className="ml-0.5 hover:text-gray-900">
                <X size={11} />
              </button>
            </span>
          )}
          {selectedState !== ALL_STATES && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              {selectedState}
              <button onClick={() => setSelectedState(ALL_STATES)} className="ml-0.5 hover:text-gray-900">
                <X size={11} />
              </button>
            </span>
          )}
          {sort !== "relevancia" && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800/20 dark:text-gray-400">
              {SORT_LABELS[sort]}
              <button onClick={() => setSort("relevancia")} className="ml-0.5 hover:text-gray-900">
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
        {filtered.length === professionals.length
          ? t("results_count", { count: filtered.length })
          : t("results_filtered", { filtered: filtered.length, total: professionals.length })}
      </p>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-slate-700">
          <Users size={40} className="mx-auto mb-3 text-gray-300 dark:text-slate-600" />
          <p className="text-gray-500 dark:text-slate-400">{t("no_results")}</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
            {t("no_results_tip")}
          </p>
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
            <ProfessionalCard key={p.id} professional={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfessionalCard({ professional: p }: { professional: Professional }) {
  const t = useTranslations("search");
  const initials = p.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/${p.slug}`}
      className={`group relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
        p.featured
          ? "border-yellow-300 ring-1 ring-yellow-200 dark:border-yellow-600/50 dark:ring-yellow-600/20"
          : "border-gray-200 dark:border-slate-700"
      }`}
    >
      {p.featured && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Sparkles size={10} className="fill-yellow-500 text-yellow-500" />
          {t("featured")}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-sm font-bold text-white overflow-hidden">
          {p.avatar_url ? (
            <Image src={p.avatar_url} alt={p.name} fill className="object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900 group-hover:text-gray-700 dark:text-slate-100 dark:group-hover:text-gray-400">
            {p.name}
          </p>
          {(p.city || p.state) && (
            <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
              <MapPin size={11} />
              {[p.city, p.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {p.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">{p.bio}</p>
      )}

      {p.areas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {p.areas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800/30 dark:text-gray-400"
            >
              {area}
            </span>
          ))}
          {p.areas.length > 3 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-slate-800 dark:text-slate-400">
              +{p.areas.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700/50">
        <div className="flex items-center gap-1">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {p.avgRating > 0 ? p.avgRating.toFixed(1) : "—"}
          </span>
          {p.reviewCount > 0 && (
            <span className="text-xs text-gray-400 dark:text-slate-500">
              ({p.reviewCount})
            </span>
          )}
        </div>
        {p.years_experience != null && (
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
            <Briefcase size={12} />
            {p.years_experience} {p.years_experience !== 1 ? t("years_plural") : t("years")}
          </div>
        )}
      </div>
    </Link>
  );
}
