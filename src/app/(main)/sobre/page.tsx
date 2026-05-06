import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Lightbulb } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Sobre o EngHub</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Somos a plataforma que está transformando a maneira como engenheiros
            e clientes se conectam no Brasil.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="text-center">
              <Target size={40} className="mx-auto text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold">Missão</h3>
              <p className="mt-2 text-sm text-gray-500">
                Democratizar o acesso a serviços de engenharia de qualidade,
                conectando profissionais qualificados a quem precisa.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <Lightbulb size={40} className="mx-auto text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold">Visão</h3>
              <p className="mt-2 text-sm text-gray-500">
                Ser a maior comunidade de engenheiros do Brasil, referência em
                qualidade e confiança.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <Users size={40} className="mx-auto text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold">Valores</h3>
              <p className="mt-2 text-sm text-gray-500">
                Transparência, qualidade profissional, inovação tecnológica e
                compromisso com nossos usuários.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Nossa História</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            O EngHub nasceu da necessidade de conectar profissionais de
            engenharia a clientes de forma simples, transparente e eficiente.
            Percebemos que muitos engenheiros talentosos tinham dificuldade em
            mostrar seu trabalho e encontrar novos clientes, enquanto pessoas e
            empresas não sabiam como encontrar profissionais qualificados para
            seus projetos.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Nossa plataforma foi construída para resolver esse problema,
            oferecendo um espaço onde engenheiros podem criar seus portfólios
            profissionais, receber avaliações de clientes e se conectar com uma
            comunidade ativa de profissionais.
          </p>
        </div>
      </div>
    </div>
  );
}
