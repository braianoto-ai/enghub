"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "../image-gallery";
import { engineeringAreaLabels } from "@/lib/utils";
import { MapPin, FolderOpen, ArrowRight } from "lucide-react";

interface ProjectImage {
  url: string;
  position: number;
}

interface Project {
  id: string;
  title: string;
  area: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  project_images: ProjectImage[] | null;
}

interface ProjetosClientProps {
  projects: Project[];
  slug: string;
}


export function ProjetosClient({ projects, slug }: ProjetosClientProps) {
  const [selectedArea, setSelectedArea] = useState<string>("all");

  const areas = useMemo(() => {
    const set = new Set(projects.map((p) => p.area));
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(
    () =>
      selectedArea === "all"
        ? projects
        : projects.filter((p) => p.area === selectedArea),
    [projects, selectedArea]
  );

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <FolderOpen size={40} className="text-gray-300" />
        <p className="text-gray-500">Nenhum projeto publicado ainda</p>
      </div>
    );
  }

  return (
    <div>
      {/* Area filter pills */}
      {areas.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedArea("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedArea === "all"
                ? "bg-violet-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            Todos ({projects.length})
          </button>
          {areas.map((area) => {
            const count = projects.filter((p) => p.area === area).length;
            return (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedArea === area
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {engineeringAreaLabels[area] ?? area} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Projects grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filtered.map((project) => {
          const galleryImages = (project.project_images ?? [])
            .sort((a, b) => a.position - b.position)
            .map((img) => img.url);

          const images =
            galleryImages.length > 0
              ? galleryImages
              : project.image_url
              ? [project.image_url]
              : [];

          return (
            <div
              key={project.id}
              className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              {images.length > 0 && (
                <ImageGallery images={images} title={project.title} />
              )}
              <div className="p-5">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{project.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                    {engineeringAreaLabels[project.area] ?? project.area}
                  </span>
                  {project.location && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                      <MapPin size={11} />
                      {project.location}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {project.description}
                  </p>
                )}
                <Link
                  href={`/${slug}/projetos/${project.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                >
                  Ver detalhes <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
