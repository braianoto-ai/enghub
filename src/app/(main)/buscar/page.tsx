"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Search, MapPin, Filter } from "lucide-react";
import { engineeringAreaLabels } from "@/lib/utils";
import Link from "next/link";

const mockProfessionals = [
  {
    slug: "joao-silva",
    name: "João Silva",
    area: "CIVIL",
    city: "São Paulo",
    state: "SP",
    rating: 4.8,
    reviewCount: 23,
    bio: "Engenheiro Civil com 15 anos de experiência em projetos residenciais e comerciais.",
    image: null,
  },
  {
    slug: "maria-santos",
    name: "Maria Santos",
    area: "ELETRICA",
    city: "Curitiba",
    state: "PR",
    rating: 4.9,
    reviewCount: 45,
    bio: "Especialista em instalações elétricas industriais e projetos de energia solar.",
    image: null,
  },
  {
    slug: "carlos-oliveira",
    name: "Carlos Oliveira",
    area: "MECANICA",
    city: "Belo Horizonte",
    state: "MG",
    rating: 4.7,
    reviewCount: 18,
    bio: "Engenheiro Mecânico focado em HVAC e projetos de climatização.",
    image: null,
  },
  {
    slug: "ana-costa",
    name: "Ana Costa",
    area: "AMBIENTAL",
    city: "Rio de Janeiro",
    state: "RJ",
    rating: 5.0,
    reviewCount: 12,
    bio: "Consultora ambiental especializada em licenciamento e estudos de impacto.",
    image: null,
  },
];

export default function BuscarPage() {
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const filtered = mockProfessionals.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchArea = !selectedArea || p.area === selectedArea;
    return matchSearch && matchArea;
  });

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Buscar Profissionais
        </h1>
        <p className="mt-2 text-gray-500">
          Encontre engenheiros e arquitetos para o seu projeto
        </p>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Buscar por nome ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todas as áreas</option>
            {Object.entries(engineeringAreaLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
        </div>

        {/* Results */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((professional) => (
            <Link href={`/${professional.slug}`} key={professional.slug}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex gap-4">
                  <Avatar name={professional.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {professional.name}
                        </h3>
                        <Badge variant="info" className="mt-1">
                          {engineeringAreaLabels[professional.area]}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <StarRating rating={Math.round(professional.rating)} size={16} />
                        <p className="mt-1 text-xs text-gray-500">
                          {professional.rating} ({professional.reviewCount}{" "}
                          avaliações)
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {professional.bio}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-400">
                      <MapPin size={14} />
                      {professional.city}, {professional.state}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              Nenhum profissional encontrado com esses filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
