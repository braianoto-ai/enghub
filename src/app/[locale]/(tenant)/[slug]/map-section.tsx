"use client";

import { useState } from "react";
import { MapPin, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface MapSectionProps {
  city: string | null;
  state: string | null;
  name: string;
}

export function MapSection({ city, state, name }: MapSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!city && !state) return null;

  const locationStr = [city, state].filter(Boolean).join(", ");
  const query = encodeURIComponent(`${locationStr}, Brasil`);
  const mapsUrl = `https://www.google.com/maps/search/${query}`;
  const embedUrl = `https://maps.google.com/maps?q=${query}&output=embed&hl=pt-BR&z=12`;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-gray-500 dark:text-zinc-400" />
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Localização</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{locationStr}</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={15} className="text-zinc-400" />
          : <ChevronDown size={15} className="text-zinc-400" />
        }
      </button>

      {/* Expandable map */}
      {expanded && (
        <>
          <div className="relative h-52 w-full border-t border-zinc-100 dark:border-zinc-800">
            <iframe
              title={`Localização de ${name}`}
              src={embedUrl}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, filter: "grayscale(20%)" }}
            />
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 border-t border-zinc-100 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
          >
            Abrir no Google Maps <ExternalLink size={11} />
          </a>
        </>
      )}
    </div>
  );
}
