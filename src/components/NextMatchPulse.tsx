import Link from 'next/link'
import { TrendingUp, Sparkles, Users, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getNextMatchStats } from '@/actions/prediction-actions'
import { formatDate, formatTime } from '@/lib/utils'

interface NextMatchPulseProps {
  matchId: string
  homeTeam: string
  awayTeam: string
  matchDate: Date
  homeTeamTla?: string | null
  awayTeamTla?: string | null
  group?: string | null
  /** Indica si hay un usuario logueado (para mostrar la sección "Tu pred vs moda") */
  hasUser: boolean
}

export async function NextMatchPulse({
  matchId,
  homeTeam,
  awayTeam,
  matchDate,
  group,
  hasUser,
}: NextMatchPulseProps) {
  const stats = await getNextMatchStats(matchId)
  const { total, mode, distribution, userPrediction } = stats

  const matchLabel = `${homeTeam} vs ${awayTeam}`
  const whenLabel = `${formatDate(matchDate)} ${formatTime(matchDate)}${group ? ` · ${group}` : ''}`

  // Sin predicciones: CTA pequeño y compacto
  if (total === 0) {
    return (
      <Card className="flex flex-col items-center justify-between gap-3 border-accent/15 bg-gradient-to-r from-primary-dark/40 via-background to-background-dark p-4 sm:flex-row sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Pulso de la comunidad
            </p>
            <p className="text-sm text-white">
              Nadie ha predicho aún{' '}
              <span className="font-semibold">{matchLabel}</span> ·{' '}
              <span className="text-text-secondary">{whenLabel}</span>
            </p>
          </div>
        </div>
        <Link href={`/predicciones/${matchId}`} scroll className="shrink-0">
          <Button size="sm">
            Hacer mi predicción
            <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        </Link>
      </Card>
    )
  }

  const isMatchMode =
    userPrediction &&
    mode &&
    userPrediction.homeGoals === mode.homeGoals &&
    userPrediction.awayGoals === mode.awayGoals

  return (
    <Card className="overflow-hidden border-accent/15 bg-gradient-to-br from-primary-dark/40 via-background to-background-dark p-4 sm:p-5">
      {/* Header compacto en una sola línea */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Pulso · {matchLabel}
            </p>
            <p className="text-[11px] text-text-secondary">{whenLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
          <Users className="h-3 w-3 text-accent" />
          <span className="font-mono text-xs font-bold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-text-secondary">
            {total === 1 ? 'pred.' : 'preds.'}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {/* MODA */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            <Sparkles className="h-3 w-3" />
            La mayoría predice
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold leading-none text-white">
              {mode?.homeGoals}
              <span className="mx-1 text-accent">-</span>
              {mode?.awayGoals}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary">
            {mode?.count} {mode?.count === 1 ? 'persona' : 'personas'} ·{' '}
            <span className="font-bold text-white">{mode?.percentage}%</span>
          </p>
        </div>

        {/* DISTRIBUCIÓN */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 md:col-span-1">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
            Distribución
          </p>
          <div className="space-y-1.5">
            <DistributionBar
              label={`${homeTeam} gana`}
              count={distribution.homeWin.count}
              percentage={distribution.homeWin.percentage}
              color="bg-success"
            />
            <DistributionBar
              label="Empate"
              count={distribution.draw.count}
              percentage={distribution.draw.percentage}
              color="bg-warning"
            />
            <DistributionBar
              label={`${awayTeam} gana`}
              count={distribution.awayWin.count}
              percentage={distribution.awayWin.percentage}
              color="bg-primary-light"
            />
          </div>
        </div>

        {/* TU PRED vs MODA */}
        {hasUser && userPrediction && mode ? (
          <div
            className={`flex flex-col justify-between rounded-xl border p-3 ${
              isMatchMode
                ? 'border-success/30 bg-success/5'
                : 'border-warning/30 bg-warning/5'
            }`}
          >
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  Tu predicción
                </p>
                {isMatchMode ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Con la mayoría
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning">
                    <XCircle className="h-3 w-3" />
                    Contraria
                  </span>
                )}
              </div>
              <span className="font-mono text-2xl font-bold text-white">
                {userPrediction.homeGoals}
                <span className="mx-1 text-text-secondary">-</span>
                {userPrediction.awayGoals}
              </span>
            </div>
            {!isMatchMode && (
              <p className="mt-1 text-[10px] text-text-secondary">
                Moda: {mode.homeGoals}-{mode.awayGoals}
              </p>
            )}
          </div>
        ) : hasUser && !userPrediction ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-accent/30 bg-accent/5 p-3 text-center">
            <p className="text-[11px] text-text-secondary">Aún no has predicho</p>
            <Link href={`/predicciones/${matchId}`} scroll>
              <Button size="sm">
                Predecir
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>
        ) : (
          // Visitante no logueado
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
            <p className="text-[11px] text-text-secondary">¿Quieres participar?</p>
            <Link href="/login" scroll>
              <Button size="sm" variant="outline">
                Iniciar sesión
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}

function DistributionBar({
  label,
  count,
  percentage,
  color,
}: {
  label: string
  count: number
  percentage: number
  color: string
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[10px]">
        <span className="font-medium text-text-primary truncate pr-2">{label}</span>
        <span className="font-mono text-text-secondary whitespace-nowrap">
          <span className="font-bold text-white">{percentage}%</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
