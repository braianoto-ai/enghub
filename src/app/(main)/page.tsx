import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Shield,
  Star,
  Users,
  Building2,
  Zap,
  ArrowRight,
} from "lucide-react";

const areas = [
  { name: "Engenharia Civil", icon: Building2, count: 0 },
  { name: "Engenharia Mecânica", icon: Zap, count: 0 },
  { name: "Engenharia Elétrica", icon: Zap, count: 0 },
  { name: "Arquitetura", icon: Building2, count: 0 },
  { name: "Engenharia Ambiental", icon: Shield, count: 0 },
  { name: "Engenharia Química", icon: Zap, count: 0 },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-24 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Encontre os melhores
            <br />
            <span className="text-blue-200">engenheiros do Brasil</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            A plataforma que conecta profissionais de engenharia a clientes.
            Portfólios verificados, avaliações reais e a facilidade que você
            precisa.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/buscar">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                <Search size={20} className="mr-2" />
                Buscar Profissionais
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button
                size="lg"
                variant="outline"
                className="!border-white !bg-transparent !text-white hover:!bg-white/10"
              >
                Sou Engenheiro
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Áreas de Engenharia
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-500">
            Encontre profissionais especializados na área que você precisa
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <Link href="/buscar" key={area.name}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <area.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {area.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {area.count} profissionais
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Por que usar o EngHub?
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Shield size={28} className="text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Profissionais Verificados
              </h3>
              <p className="mt-2 text-gray-500">
                Todos os profissionais com CREA/CAU verificados para sua
                segurança
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Star size={28} className="text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Avaliações Reais
              </h3>
              <p className="mt-2 text-gray-500">
                Veja avaliações de clientes reais antes de contratar
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Users size={28} className="text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Comunidade
              </h3>
              <p className="mt-2 text-gray-500">
                Conecte-se com outros profissionais e expanda sua rede
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Crie seu perfil gratuito e comece a receber clientes hoje mesmo.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="mt-8">
              Criar meu perfil grátis
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
