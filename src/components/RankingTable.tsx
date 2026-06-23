import { Crown, Medal, Sparkles, Trophy, TrendingUp, TrendingDown, Minus, Sparkle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { RankingEntry } from '@/types'

// Helper para renderizar la tendencia
function TrendBadge({
  trend,
  size = 'sm',
}: {
  trend: RankingEntry['trend']
  size?: 'sm' | 'md'
}) {
  const { direction, delta } = trend
  const sizeClasses = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  const textClasses = size === 'md' ? 'text-xs' : 'text-[10px]'
  const paddingClasses = size === 'md' ? 'px-1.5 py-0.5' : 'px-1 py-0.5'

  if (direction === 'NEW') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full border border-accent/30 bg-accent/15 font-bold uppercase tracking-wider text-accent ${textClasses} ${paddingClasses}`}
        title="Nuevo en el ranking"
      >
        <Sparkle className={sizeClasses} />
        Nuevo
      </span>
    )
  }

  if (direction === 'UP') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full border border-success/30 bg-success/15 font-bold text-success ${textClasses} ${paddingClasses}`}
        title={`Subió ${delta} posiciones (estaba #${trend.previousPosition})`}
      >
        <TrendingUp className={sizeClasses} />
        {delta}
      </span>
    )
  }

  if (direction === 'DOWN') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded-full border border-error/30 bg-error/15 font-bold text-error ${textClasses} ${paddingClasses}`}
        title={`Bajó ${Math.abs(delta ?? 0)} posiciones (estaba #${trend.previousPosition})`}
      >
        <TrendingDown className={sizeClasses} />
        {Math.abs(delta ?? 0)}
      </span>
    )
  }

  // SAME
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/5 font-bold text-text-secondary ${textClasses} ${paddingClasses}`}
      title="Sin cambios"
    >
      <Minus className={sizeClasses} />
      =
    </span>
  )
}

interface RankingTableProps {
  ranking: RankingEntry[]
  currentUserId?: string
  variant?: 'default' | 'compact'
}

// Estilos para el podio (top 3) según posición
const PODIUM_STYLES = {
  1: {
    border: 'border-accent',
    ring: 'ring-2 ring-accent/30',
    bg: 'bg-gradient-to-b from-accent/20 via-primary-light/20 to-surface-dark/90',
    icon: Crown,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/20',
    height: 'min-h-[240px]',
    offset: 'md:-translate-y-4',
    badge: 'Campeon',
    crown: true,
  },
  2: {
    border: 'border-primary-light/50',
    ring: 'ring-1 ring-primary-light/25',
    bg: 'bg-gradient-to-b from-primary-light/20 to-surface-dark/90',
    icon: Medal,
    iconColor: 'text-white',
    iconBg: 'bg-primary-light/30',
    height: 'min-h-[220px]',
    offset: 'md:translate-y-3',
    badge: 'Subcampeon',
    crown: false,
  },
  3: {
    border: 'border-accent/40',
    ring: 'ring-1 ring-accent/25',
    bg: 'bg-gradient-to-b from-accent/10 to-surface-dark/90',
    icon: Medal,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/20',
    height: 'min-h-[205px]',
    offset: 'md:translate-y-6',
    badge: 'Top 3',
    crown: false,
  },
}

export function RankingTable({ ranking, currentUserId, variant = 'default' }: RankingTableProps) {
  if (ranking.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No hay participantes en el ranking aún.</p>
      </div>
    )
  }

  const top3 = ranking.filter((e) => e.position <= 3)
  const rest = ranking.filter((e) => e.position > 3)

  const podiumEntries = [...top3].sort((a, b) => a.position - b.position)
  const compactPodiumOrder = [...top3].sort((a, b) => a.position - b.position)
  const isCompact = variant === 'compact'

  return (
    <div className={isCompact ? 'space-y-6' : 'space-y-10'}>
      {/* PODIO TOP 3 */}
      {top3.length > 0 && (
        <div className={`relative overflow-hidden border border-accent/15 bg-gradient-to-br from-primary-dark via-background to-background-dark shadow-[0_24px_80px_rgba(1,9,53,0.45)] ${
          isCompact ? 'rounded-3xl px-4 py-5' : 'rounded-[28px] px-4 py-8 sm:px-6 lg:px-8'
        }`}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-primary-light/20 blur-3xl" />
            <div className="absolute right-10 top-12 h-24 w-24 rounded-full bg-accent/10 blur-3xl" />
          </div>

          {isCompact ? (
            <div className="relative mb-4 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Podio
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-3 text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                <Sparkles className="h-4 w-4" />
                Lideres Del Torneo
              </div>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <h2 className="font-display text-2xl text-white sm:text-3xl">Podio Ranking</h2>
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <p className="max-w-2xl text-sm text-text-secondary sm:text-base">
                Los participantes con mejor rendimiento aparecen primero con su puntaje exacto y sus aciertos destacados.
              </p>
            </div>
          )}

          {isCompact ? (
            <div className="relative mx-auto space-y-3">
              {compactPodiumOrder.map((entry) => {
                const style = PODIUM_STYLES[entry.position as 1 | 2 | 3]
                const Icon = style.icon
                const isMe = entry.id === currentUserId
                return (
                  <Card
                    key={entry.id}
                    className={`${style.bg} ${style.border} ${style.ring} relative overflow-hidden px-4 py-4 transition-transform duration-300 hover:-translate-y-1`}
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent via-accent/60 to-transparent" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-lg shadow-primary-dark/20">
                        <Icon className={`h-5 w-5 ${style.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-display text-2xl leading-none ${style.iconColor}`}>
                            {entry.position}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.24em] text-text-secondary">
                            {style.badge}
                          </span>
                          <TrendBadge trend={entry.trend} />
                        </div>
                        <p className="mt-1 truncate font-heading text-base font-bold text-white">
                          {entry.name}
                          {isMe && <span className="ml-1 text-[10px] text-accent">(Tú)</span>}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                        <p className="font-mono text-2xl font-bold leading-none text-accent">
                          {entry.totalPoints}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                          Pts
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="relative grid max-w-4xl grid-cols-1 gap-4 items-end mx-auto sm:grid-cols-2 md:grid-cols-3">
              {podiumEntries.map((entry) => {
                const style = PODIUM_STYLES[entry.position as 1 | 2 | 3]
                const Icon = style.icon
                const isMe = entry.id === currentUserId
                const responsiveOrder =
                  entry.position === 1
                    ? 'order-1 md:order-2'
                    : entry.position === 2
                      ? 'order-2 md:order-1'
                      : 'order-3'
                return (
                  <Card
                    key={entry.id}
                    className={`${responsiveOrder} ${style.bg} ${style.border} ${style.ring} ${style.height} ${style.offset} px-5 py-6 text-center relative overflow-hidden transition-transform duration-300 hover:-translate-y-1`}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent/80 to-transparent" />
                    <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                      #{entry.position}
                    </div>
                    {style.crown && (
                      <div className="absolute -top-1 left-0 right-0 text-center">
                        <Crown className="w-7 h-7 text-accent mx-auto fill-accent" />
                      </div>
                    )}
                    <div className="mb-4 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full ${style.iconBg} flex items-center justify-center shadow-lg shadow-primary-dark/20`}>
                        <Icon className={`w-8 h-8 ${style.iconColor}`} />
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-text-secondary">
                        {style.badge}
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <p className={`font-display text-4xl leading-none ${style.iconColor}`}>
                          {entry.position}
                        </p>
                        <TrendBadge trend={entry.trend} size="md" />
                      </div>
                    </div>
                    <p className="font-heading font-bold text-white text-base truncate px-2">
                      {entry.name}
                      {isMe && <span className="ml-1 text-accent text-xs">(Tú)</span>}
                    </p>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="font-mono text-3xl font-bold text-accent leading-none">
                        {entry.totalPoints}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-text-secondary">Puntos</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                      <div className="rounded-xl bg-black/10 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-text-secondary">Aciertos</p>
                        <p className="mt-1 font-mono text-lg font-bold text-accent">{entry.hits}</p>
                      </div>
                      <div className="rounded-xl bg-black/10 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-text-secondary">Exactos</p>
                        <p className="mt-1 font-mono text-lg font-bold text-white">{entry.exactScores}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* RESTO DEL RANKING (lista simple) */}
      {rest.length > 0 && (
        <div>
          <div className="border-t border-surface-light pt-6">
            <h3 className="font-heading text-sm uppercase tracking-[0.25em] text-text-secondary mb-4 px-2">
              Clasificación General
            </h3>
            <div className="space-y-2">
              {rest.map((entry) => {
                const isMe = entry.id === currentUserId
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl bg-surface/40 transition-colors ${
                      isMe ? 'border border-accent/40 bg-accent/5 shadow-lg shadow-accent/5' : 'border border-transparent hover:bg-surface/60'
                    }`}
                  >
                    {/* Posición + Tendencia */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                        <span className="font-mono font-bold text-text-secondary text-sm">
                          {entry.position}
                        </span>
                      </div>
                      <TrendBadge trend={entry.trend} />
                    </div>

                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary truncate text-sm">
                        {entry.name}
                        {isMe && <span className="ml-2 text-xs text-accent">(Tú)</span>}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {entry.predictionsCount} predicciones
                      </p>
                    </div>

                    {/* Puntos */}
                    <div className="text-right">
                      <p className="font-mono font-bold text-accent">
                        {entry.totalPoints}
                      </p>
                      <p className="text-xs text-text-secondary">pts</p>
                    </div>

                    {/* Detalles */}
                    {!isCompact && (
                      <div className="hidden sm:flex items-center gap-3 text-xs">
                        <div className="text-center px-2">
                          <p className="font-mono font-semibold text-accent">
                            {entry.hits}
                          </p>
                          <p className="text-text-secondary">aciertos</p>
                        </div>
                        <div className="text-center px-2">
                          <p className="font-mono font-semibold text-text-primary">
                            {entry.exactScores}
                          </p>
                          <p className="text-text-secondary">exactos</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
