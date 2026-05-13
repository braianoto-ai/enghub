// Area slugs → DB keys
export const areaSlugToKey: Record<string, string> = {
  civil:        "CIVIL",
  mecanica:     "MECANICA",
  eletrica:     "ELETRICA",
  quimica:      "QUIMICA",
  ambiental:    "AMBIENTAL",
  florestal:    "FLORESTAL",
  producao:     "PRODUCAO",
  alimentos:    "ALIMENTOS",
  computacao:   "COMPUTACAO",
  arquitetura:  "ARQUITETURA",
  agronomia:    "AGRONOMIA",
};

export const areaKeyToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(areaSlugToKey).map(([slug, key]) => [key, slug])
);

// Brazilian states
export const brazilianStates: { uf: string; name: string; slug: string }[] = [
  { uf: "AC", name: "Acre",              slug: "ac" },
  { uf: "AL", name: "Alagoas",           slug: "al" },
  { uf: "AP", name: "Amapá",             slug: "ap" },
  { uf: "AM", name: "Amazonas",          slug: "am" },
  { uf: "BA", name: "Bahia",             slug: "ba" },
  { uf: "CE", name: "Ceará",             slug: "ce" },
  { uf: "DF", name: "Distrito Federal",  slug: "df" },
  { uf: "ES", name: "Espírito Santo",    slug: "es" },
  { uf: "GO", name: "Goiás",             slug: "go" },
  { uf: "MA", name: "Maranhão",          slug: "ma" },
  { uf: "MT", name: "Mato Grosso",       slug: "mt" },
  { uf: "MS", name: "Mato Grosso do Sul",slug: "ms" },
  { uf: "MG", name: "Minas Gerais",      slug: "mg" },
  { uf: "PA", name: "Pará",              slug: "pa" },
  { uf: "PB", name: "Paraíba",           slug: "pb" },
  { uf: "PR", name: "Paraná",            slug: "pr" },
  { uf: "PE", name: "Pernambuco",        slug: "pe" },
  { uf: "PI", name: "Piauí",             slug: "pi" },
  { uf: "RJ", name: "Rio de Janeiro",    slug: "rj" },
  { uf: "RN", name: "Rio Grande do Norte",slug: "rn" },
  { uf: "RS", name: "Rio Grande do Sul", slug: "rs" },
  { uf: "RO", name: "Rondônia",          slug: "ro" },
  { uf: "RR", name: "Roraima",           slug: "rr" },
  { uf: "SC", name: "Santa Catarina",    slug: "sc" },
  { uf: "SP", name: "São Paulo",         slug: "sp" },
  { uf: "SE", name: "Sergipe",           slug: "se" },
  { uf: "TO", name: "Tocantins",         slug: "to" },
];

export const stateSlugToUF: Record<string, string> = Object.fromEntries(
  brazilianStates.map((s) => [s.slug, s.uf])
);

export const stateSlugToName: Record<string, string> = Object.fromEntries(
  brazilianStates.map((s) => [s.slug, s.name])
);
