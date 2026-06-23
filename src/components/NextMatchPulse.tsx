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
              Pulso
            </p>
            <p className="text-sm text-white">{matchLabel}</p>
            <p className="text-xs text-text-secondary">{whenLabel}</p>
          </div>
        </div>
        <Link href={`/predicciones/${matchId}`} scroll className="shrink-0">
          <Button size="sm">
            Predecir
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
    <Card className="overflow-hidden border-accent/15 bg-gradient-to-br from-primary-dark/50 via-background to-background-dark p-4 sm:p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 shadow-lg shadow-accent/10">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">
              <Sparkles className="h-3 w-3" />
              Pulso
            </div>
            <p className="text-base font-semibold text-white sm:text-lg">{matchLabel}</p>
            <p className="text-xs text-text-secondary sm:text-sm">{whenLabel}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
          <Users className="h-4 w-4 text-accent" />
          <span className="font-mono text-sm font-bold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">
            {total === 1 ? 'prediccion' : 'predicciones'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
        <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/12 via-white/[0.03] to-transparent p-5 shadow-xl shadow-primary-dark/15">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              La mayoria predice
            </p>
            <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
              {mode?.percentage}%
            </div>
          </div>

          <div className="mb-4 flex items-end gap-3">
            <span className="font-mono text-5xl font-bold leading-none text-white sm:text-6xl">
              {mode?.homeGoals}
              <span className="mx-2 text-accent">-</span>
              {mode?.awayGoals}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Consenso</p>
              <p className="mt-2 text-lg font-semibold text-white">{mode?.percentage}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Predicciones</p>
              <p className="mt-2 text-lg font-semibold text-white">{total}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-text-secondary">
                Distribucion del resultado
              </p>
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Comunidad</span>
            </div>
            <div className="space-y-3">
              <DistributionBar
                label={homeTeam}
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
                label={awayTeam}
                count={distribution.awayWin.count}
                percentage={distribution.awayWin.percentage}
                color="bg-primary-light"
              />
            </div>
          </div>

          {hasUser && userPrediction && mode ? (
            <div
              className={`rounded-3xl border p-4 ${
                isMatchMode
                  ? 'border-success/25 bg-success/8'
                  : 'border-warning/25 bg-warning/8'
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-text-secondary">
                  Tu prediccion
                </p>
                {isMatchMode ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Igual
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-semibold text-warning">
                    <XCircle className="h-3 w-3" />
                    Distinta
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Tu marcador</p>
                  <p className="mt-2 font-mono text-3xl font-bold text-white">
                    {userPrediction.homeGoals}
                    <span className="mx-1 text-text-secondary">-</span>
                    {userPrediction.awayGoals}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Moda</p>
                  <p className="mt-2 font-mono text-3xl font-bold text-white">
                    {mode.homeGoals}
                    <span className="mx-1 text-accent">-</span>
                    {mode.awayGoals}
                  </p>
                </div>
              </div>
            </div>
          ) : hasUser && !userPrediction ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-accent/30 bg-accent/5 p-5 text-center">
              <p className="text-sm text-text-secondary">Sin prediccion</p>
              <Link href={`/predicciones/${matchId}`} scroll>
                <Button size="sm">
                  Predecir
                  <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <p className="text-sm text-text-secondary">Inicia sesion</p>
              <Link href="/login" scroll>
                <Button size="sm" variant="outline">
                  Entrar
                  <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>
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
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
        <span className="truncate font-medium text-text-primary">{label}</span>
        <span className="whitespace-nowrap text-text-secondary">
          <span className="mr-2 text-[10px]">{count}</span>
          <span className="font-mono font-bold text-white">{percentage}%</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
