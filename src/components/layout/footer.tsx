import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700">
                <span className="font-bold text-white">E</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">Eng<span className="text-gray-700 dark:text-gray-400">Hub</span></span>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400">
              {t("tagline")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-200">{t("platform_heading")}</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/buscar" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">{t("platform_search")}</Link></li>
              <li><Link href="/engenheiros" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">Por especialidade</Link></li>
              <li><Link href="/projetos" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">Projetos</Link></li>
              <li><Link href="/planos" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">{t("platform_plans")}</Link></li>
              <li><Link href="/cadastro" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">{t("platform_signup")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-200">{t("areas_heading")}</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-gray-500 dark:text-zinc-400">{t("area_civil")}</li>
              <li className="text-sm text-gray-500 dark:text-zinc-400">{t("area_mecanica")}</li>
              <li className="text-sm text-gray-500 dark:text-zinc-400">{t("area_eletrica")}</li>
              <li className="text-sm text-gray-500 dark:text-zinc-400">{t("area_arquitetura")}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-200">{t("support_heading")}</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/sobre" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">{t("support_about")}</Link></li>
              <li><Link href="/contato" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">{t("support_contact")}</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">Blog</Link></li>
              <li><Link href="/noticias" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">Notícias do setor</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-gray-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} EngHub. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
