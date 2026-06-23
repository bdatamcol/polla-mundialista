import Link from 'next/link'
import { Activity, ArrowRight, Target } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getRecentPredictions } from '@/actions/prediction-actions'
import { formatRelativeTime } from '@/lib/utils'
import type { MatchStatus } from '@/types'

interface RecentPredictionsFeedProps {
  limit?: number
  /** Si true, muestra el CTA de login al final (cuando no hay usuario) */
  ctaLogin?: boolean
}

const STATUS_STYLES: Record<MatchStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente', className: 'bg-warning/15 text-warning border-warning/30' },
  LIVE: { label: 'En vivo', className: 'bg-error/15 text-error border-error/30' },
  FINISHED: { label: 'Finalizado', className: 'bg-success/15 text-success border-success/30' },
}

export async function RecentPredictionsFeed({
  limit = 10,
  ctaLogin = false,
}: RecentPredictionsFeedProps) {
  const predictions = await getRecentPredictions(limit)

  if (predictions.length === 0) {
    return (
      <Card className="border-accent/15 bg-gradient-to-r from-primary-dark/40 to-background-dark p-5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <Activity className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Actividad en vivo
            </p>
            <p className="text-sm text-white">
              Aún no hay predicciones. Sé el primero en lanzar un marcador.
            </p>
          </div>
          <Link href="/predicciones" scroll className="shrink-0">
            <Button size="sm">
              Empezar a predecir
              <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-accent/15 bg-gradient-to-br from-primary-dark/45 via-background to-background-dark p-4 sm:p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 shadow-lg shadow-accent/10">
            <Activity className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
              <span className="relative mr-1.5 inline-flex h-1.5 w-1.5 align-middle">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Actividad en vivo
            </p>
            <p className="text-lg font-semibold text-white">Ultimas predicciones</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-secondary">
            <span className="font-mono text-base font-bold text-white">{predictions.length}</span>
            <span className="ml-2">recientes</span>
          </div>
          <Link href="/predicciones" scroll>
            <Button variant="ghost" size="sm">
              Ver
              <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      <ul className="space-y-3">
        {predictions.map((p) => {
          const status = STATUS_STYLES[p.match.status] ?? STATUS_STYLES.PENDING
          return (
            <li
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:bg-white/[0.05]"
            >
              <div className="absolute left-[19px] top-[52px] hidden h-[calc(100%-64px)] w-px bg-gradient-to-b from-accent/25 to-transparent sm:block" />

              <div className="flex items-start gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent shadow-lg shadow-primary-dark/10">
                  <Target className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-sm font-bold text-accent">
                        {p.homeGoals}-{p.awayGoals}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <span suppressHydrationWarning className="text-[11px] text-text-secondary">
                      {formatRelativeTime(p.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm font-semibold leading-relaxed text-white sm:text-[15px]">
                    {p.match.homeTeam} vs {p.match.awayTeam}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
                    <span className="rounded-full bg-white/5 px-2.5 py-1">
                      {p.match.status === 'PENDING' ? 'Por jugar' : p.match.status === 'LIVE' ? 'En vivo' : 'Finalizado'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/predicciones/${p.match.id}`}
                  scroll
                  className="hidden shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 text-text-secondary transition-colors group-hover:border-accent/20 group-hover:text-accent sm:block"
                  title="Ver partido"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      {ctaLogin && (
        <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
          <p className="text-xs text-text-secondary">Inicia sesion para participar.</p>
          <Link href="/login" scroll>
            <Button size="sm" className="mt-2">
              Entrar
              <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
