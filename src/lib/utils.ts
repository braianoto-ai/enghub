import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const engineeringAreaLabels: Record<string, string> = {
  CIVIL: "Engenharia Civil",
  MECANICA: "Engenharia Mecânica",
  ELETRICA: "Engenharia Elétrica",
  QUIMICA: "Engenharia Química",
  AMBIENTAL: "Engenharia Ambiental",
  FLORESTAL: "Engenharia Florestal",
  PRODUCAO: "Engenharia de Produção",
  ALIMENTOS: "Engenharia de Alimentos",
  COMPUTACAO: "Engenharia de Computação",
  ARQUITETURA: "Arquitetura e Urbanismo",
  AGRONOMIA: "Agronomia",
  OUTRA: "Outra",
};
