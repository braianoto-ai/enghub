import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EngHub — Plataforma para Engenheiros",
    short_name: "EngHub",
    description:
      "Encontre engenheiros, veja portfólios verificados e solicite orçamentos.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    categories: ["business", "productivity"],
    lang: "pt-BR",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/og-screenshot.png",
        sizes: "1280x720",
        type: "image/png",
        // @ts-expect-error — form_factor não está no tipo ainda mas é válido
        form_factor: "wide",
        label: "EngHub no desktop",
      },
    ],
    shortcuts: [
      {
        name: "Buscar Engenheiros",
        short_name: "Buscar",
        description: "Encontre profissionais de engenharia",
        url: "/buscar",
        icons: [{ src: "/icon", sizes: "96x96" }],
      },
      {
        name: "Meu Dashboard",
        short_name: "Dashboard",
        description: "Acesse seu painel profissional",
        url: "/dashboard",
        icons: [{ src: "/icon", sizes: "96x96" }],
      },
    ],
  };
}
