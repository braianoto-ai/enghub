import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink, TrendingUp } from "lucide-react";

interface ScoreItem {
  label: string;
  description: string;
  done: boolean;
  points: number;
  href: string;
}

interface ProfileScoreProps {
  items: ScoreItem[];
  slug: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#22c55e" :
    score >= 50 ? "#f59e0b" :
    "#ef4444";

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="-rotate-90" width="136" height="136" viewBox="0 0 136 136">
        {/* Track */}
        <circle cx="68" cy="68" r={radius} fill="none" stroke="currentColor"
          strokeWidth="10" className="text-zinc-100 dark:text-zinc-800" />
        {/* Progress */}
        <circle cx="68" cy="68" r={radius} fill="none" stroke={color}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{score}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">completo</span>
      </div>
    </div>
  );
}

export function ProfileScoreCard({ items, slug }: ProfileScoreProps) {
  const earned = items.filter((i) => i.done).reduce((s, i) => s + i.points, 0);
  const total  = items.reduce((s, i) => s + i.points, 0);
  const score  = Math.round((earned / total) * 100);

  const pending = items.filter((i) => !i.done);
  const done    = items.filter((i) => i.done);

  const label =
    score === 100 ? "Perfil completo! 🎉" :
    score >= 80   ? "Perfil quase lá 🚀" :
    score >= 50   ? "Perfil em progresso" :
    "Perfil incompleto";

  const labelColor =
    score >= 80  ? "text-green-600 dark:text-green-400" :
    score >= 50  ? "text-yellow-600 dark:text-yellow-400" :
    "text-red-600 dark:text-red-400";

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <TrendingUp size={18} className="text-gray-500" />
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Completude do perfil</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Perfis completos recebem até 5× mais contatos</p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* Ring */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <ScoreRing score={score} />
            <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
            <Link
              href={`/${slug}`}
              target="_blank"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Ver meu perfil <ExternalLink size={11} />
            </Link>
          </div>

          {/* Checklist */}
          <div className="flex-1 space-y-2">
            {/* Pending first */}
            {pending.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-start gap-3 rounded-xl border border-dashed border-zinc-200 px-4 py-2.5 transition-colors hover:border-gray-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
              >
                <Circle size={16} className="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.label}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{item.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  +{item.points}pts
                </span>
              </Link>
            ))}

            {/* Done items (collapsed if many) */}
            {done.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Concluídos</p>
                {done.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl px-4 py-2">
                    <CheckCircle2 size={15} className="shrink-0 text-green-500" />
                    <p className="text-sm text-zinc-400 line-through dark:text-zinc-500">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
