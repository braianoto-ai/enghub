import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="font-bold text-white">E</span>
              </div>
              <span className="text-lg font-bold text-gray-900">EngHub</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              A plataforma que conecta engenheiros e clientes. Mostre seu
              trabalho e encontre os melhores profissionais.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Plataforma</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/buscar"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Buscar Profissionais
                </Link>
              </li>
              <li>
                <Link
                  href="/planos"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link
                  href="/cadastro"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cadastre-se
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Áreas</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-gray-500">Engenharia Civil</li>
              <li className="text-sm text-gray-500">Engenharia Mecânica</li>
              <li className="text-sm text-gray-500">Engenharia Elétrica</li>
              <li className="text-sm text-gray-500">Arquitetura</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Suporte</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} EngHub. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
