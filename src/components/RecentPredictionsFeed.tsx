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
    <Card className="border-accent/15 bg-gradient-to-br from-primary-dark/40 to-background-dark p-4 sm:p-5">
      {/* Header compacto */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15">
            <Activity className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              <span className="relative mr-1.5 inline-flex h-1.5 w-1.5 align-middle">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Actividad en vivo
            </p>
            <p className="text-[11px] text-text-secondary">
              Últimas predicciones de la comunidad
            </p>
          </div>
        </div>
        <Link href="/predicciones" scroll>
          <Button variant="ghost" size="sm">
            Ver más
            <ArrowRight className="ml-1 w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Feed */}
      <ul className="divide-y divide-white/5">
        {predictions.map((p) => {
          const status = STATUS_STYLES[p.match.status] ?? STATUS_STYLES.PENDING
          return (
            <li
              key={p.id}
              className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-white/[0.02]"
            >
              {/* Icono de predicción */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Target className="h-4 w-4" />
              </div>

              {/* Contenido */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">
                  <span className="text-text-secondary">Se apostó </span>
                  <span className="font-mono font-bold text-accent">
                    {p.homeGoals}-{p.awayGoals}
                  </span>
                  <span className="text-text-secondary"> para </span>
                  <span className="font-semibold text-white">
                    {p.match.homeTeam} vs {p.match.awayTeam}
                  </span>
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-text-secondary">
                  <span suppressHydrationWarning>{formatRelativeTime(p.createdAt)}</span>
                  <span aria-hidden>·</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Link al partido */}
              <Link
                href={`/predicciones/${p.match.id}`}
                scroll
                className="hidden shrink-0 text-text-secondary transition-colors group-hover:text-accent sm:block"
                title="Ver partido"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          )
        })}
      </ul>

      {ctaLogin && (
        <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
          <p className="text-xs text-text-secondary">
            ¿Quieres ver tu predicción aquí? Inicia sesión y empieza a jugar.
          </p>
          <Link href="/login" scroll>
            <Button size="sm" className="mt-2">
              Iniciar sesión
              <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
