import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    description: "Ideal para começar e mostrar seu trabalho",
    badge: null,
    features: [
      "1 perfil profissional",
      "Até 5 projetos no portfólio",
      "Página pública básica",
      "Aparecer nas buscas",
      "Receber avaliações",
    ],
    cta: "Começar grátis",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para profissionais que querem se destacar",
    badge: "Popular",
    features: [
      "Tudo do Gratuito",
      "Projetos ilimitados",
      "Subdomínio personalizado",
      "Destaque nas buscas",
      "Selo de verificado",
      "Estatísticas de visitas",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    variant: "primary" as const,
  },
  {
    name: "Empresa",
    price: "R$ 129",
    period: "/mês",
    description: "Para escritórios e empresas de engenharia",
    badge: null,
    features: [
      "Tudo do Pro",
      "Até 10 membros na equipe",
      "Página da empresa",
      "Domínio próprio",
      "Gestão de equipe",
      "Relatórios avançados",
      "API de integração",
    ],
    cta: "Assinar Empresa",
    variant: "outline" as const,
  },
  {
    name: "Premium",
    price: "R$ 299",
    period: "/mês",
    description: "Solução completa para grandes empresas",
    badge: null,
    features: [
      "Tudo do Empresa",
      "Membros ilimitados",
      "Templates de documentos técnicos",
      "Geração de ART/RRT",
      "Integração com CREA",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
    cta: "Falar com vendas",
    variant: "outline" as const,
  },
];

export default function PlanosPage() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Planos e Preços
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            Escolha o plano ideal para o seu momento profissional. Comece grátis
            e faça upgrade quando precisar.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.badge
                  ? "relative border-blue-600 ring-2 ring-blue-600"
                  : ""
              }
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="info" className="px-3 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-green-500"
                      />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/cadastro" className="mt-6 block">
                  <Button variant={plan.variant} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
