"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, User, FolderOpen } from "lucide-react";
import { engineeringAreaLabels } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  area: string;
  location: string | null;
  description: string | null;
  image_url: string;
  tenant_name: string;
  tenant_slug: string;
}

interface ProjetosPublicosClientProps {
  projects: Project[];
  initialArea?: string;
}

const ALL = "Todos";

export function ProjetosPublicosClient({ projects, initialArea = "" }: ProjetosPublicosClientProps) {
  const areas = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => { if (p.area) set.add(p.area); });
    return [ALL, ...Array.from(set).sort()];
  }, [projects]);

  const [selectedArea, setSelectedArea] = useState(
    initialArea && initialArea !== ALL ? initialArea : ALL
  );

  const filtered = useMemo(() =>
    selectedArea === ALL
      ? projects
      : projects.filter((p) => p.area === selectedArea),
    [projects, selectedArea]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400">
          <FolderOpen size={15} />
          Galeria de Projetos
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100">
          Projetos de Engenharia
        </h1>
        <p className="mt-2 text-gray-500 dark:text-zinc-400">
          Explore {projects.length} projeto{projects.length !== 1 ? "s" : ""} reais publicados por profissionais do EngHub.
        </p>
      </div>

      {/* Area filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {areas.map((area) => {
          const label = area === ALL ? "Todos" : (engineeringAreaLabels[area] ?? area);
          const count = area === ALL ? projects.length : projects.filter((p) => p.area === area).length;
          return (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                selectedArea === area
                  ? "border-gray-700 bg-gray-700 text-white dark:border-gray-500 dark:bg-gray-600"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                selectedArea === area
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="mb-5 text-sm text-gray-400 dark:text-zinc-500">
        {filtered.length === projects.length
          ? `${projects.length} projeto${projects.length !== 1 ? "s" : ""}`
          : `${filtered.length} de ${projects.length} projeto${projects.length !== 1 ? "s" : ""}`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <FolderOpen size={40} className="text-gray-300 dark:text-zinc-600" />
          <p className="text-gray-500 dark:text-zinc-400">Nenhum projeto encontrado nesta área.</p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">É engenheiro ou arquiteto?</h2>
        <p className="mt-2 text-zinc-400">
          Crie seu perfil gratuito e mostre seus projetos para milhares de potenciais clientes.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/cadastro"
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100"
          >
            Criar perfil grátis
          </Link>
          <Link
            href="/buscar"
            className="rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Buscar profissionais
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <Link
      href={`/${p.tenant_slug}/projetos/${p.id}`}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-zinc-800" style={{ aspectRatio: "4/3" }}>
        <Image
          src={p.image_url}
          alt={p.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Area badge overlay */}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {engineeringAreaLabels[p.area] ?? p.area}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 dark:text-zinc-100 dark:group-hover:text-zinc-300 line-clamp-1">
          {p.title}
        </h3>

        {p.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">
            {p.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
            <User size={11} />
            <span className="truncate max-w-[120px]">{p.tenant_name}</span>
          </div>
          {p.location && (
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500">
              <MapPin size={11} />
              <span className="truncate max-w-[100px]">{p.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
