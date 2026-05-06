"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "../image-gallery";
import { engineeringAreaLabels } from "@/lib/utils";
import { MapPin, FolderOpen } from "lucide-react";

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

export function ProjetosClient({ projects }: ProjetosClientProps) {
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
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
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
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {images.length > 0 && (
                <ImageGallery images={images} title={project.title} />
              )}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="info">
                    {engineeringAreaLabels[project.area] ?? project.area}
                  </Badge>
                  {project.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} />
                      {project.location}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
