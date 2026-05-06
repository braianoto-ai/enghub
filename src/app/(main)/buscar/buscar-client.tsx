"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Star, Briefcase, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Professional {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  areas: string[];
  city: string | null;
  state: string | null;
  years_experience: number | null;
  avgRating: number;
  reviewCount: number;
}

interface BuscarClientProps {
  professionals: Professional[];
}

const ALL_AREAS = "Todas as áreas";

export function BuscarClient({ professionals }: BuscarClientProps) {
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState(ALL_AREAS);

  const areas = useMemo(() => {
    const set = new Set<string>();
    professionals.forEach((p) => p.areas.forEach((a) => set.add(a)));
    return [ALL_AREAS, ...Array.from(set).sort()];
  }, [professionals]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return professionals.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.state ?? "").toLowerCase().includes(q);
      const matchArea =
        selectedArea === ALL_AREAS || p.areas.includes(selectedArea);
      return matchSearch && matchArea;
    });
  }, [professionals, search, selectedArea]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Encontre um engenheiro
        </h1>
        <p className="mt-2 text-gray-500">
          {professionals.length} profissional{professionals.length !== 1 ? "is" : ""} cadastrado{professionals.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-56"
        >
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Nenhum profissional encontrado</p>
          <p className="mt-1 text-sm text-gray-400">
            Tente ajustar os filtros de busca
          </p>
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
  const initials = p.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/${p.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900 group-hover:text-blue-600">
            {p.name}
          </p>
          {(p.city || p.state) && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} />
              {[p.city, p.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {p.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500">{p.bio}</p>
      )}

      {p.areas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {p.areas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {area}
            </span>
          ))}
          {p.areas.length > 3 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              +{p.areas.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">
            {p.avgRating > 0 ? p.avgRating.toFixed(1) : "—"}
          </span>
          {p.reviewCount > 0 && (
            <span className="text-xs text-gray-400">
              ({p.reviewCount})
            </span>
          )}
        </div>
        {p.years_experience != null && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Briefcase size={12} />
            {p.years_experience} ano{p.years_experience !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
