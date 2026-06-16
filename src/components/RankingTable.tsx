import { Crown, Medal, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { RankingEntry } from '@/types'

interface RankingTableProps {
  ranking: RankingEntry[]
  currentUserId?: string
}

// Estilos para el podio (top 3) según posición
const PODIUM_STYLES = {
  1: {
    border: 'border-accent',
    ring: 'ring-2 ring-accent/30',
    bg: 'bg-gradient-to-b from-accent/15 via-accent/5 to-transparent',
    icon: Crown,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/20',
    height: 'min-h-[200px]',
    crown: true,
  },
  2: {
    border: 'border-gray-300/40',
    ring: 'ring-1 ring-gray-300/20',
    bg: 'bg-gradient-to-b from-gray-300/10 to-transparent',
    icon: Medal,
    iconColor: 'text-gray-300',
    iconBg: 'bg-gray-300/20',
    height: 'min-h-[180px]',
    crown: false,
  },
  3: {
    border: 'border-amber-600/40',
    ring: 'ring-1 ring-amber-600/20',
    bg: 'bg-gradient-to-b from-amber-600/10 to-transparent',
    icon: Medal,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-600/20',
    height: 'min-h-[160px]',
    crown: false,
  },
}

export function RankingTable({ ranking, currentUserId }: RankingTableProps) {
  if (ranking.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No hay participantes en el ranking aún.</p>
      </div>
    )
  }

  const top3 = ranking.filter((e) => e.position <= 3)
  const rest = ranking.filter((e) => e.position > 3)

  // Reordenar top 3 para el podio: 2do - 1ro - 3ro
  const podiumOrder = [
    top3.find((e) => e.position === 2),
    top3.find((e) => e.position === 1),
    top3.find((e) => e.position === 3),
  ].filter(Boolean) as RankingEntry[]

  return (
    <div className="space-y-10">
      {/* PODIO TOP 3 */}
      {top3.length > 0 && (
        <div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl text-white">PODIO</h2>
            <Trophy className="w-5 h-5 text-accent" />
          </div>
          <div className="grid grid-cols-3 gap-3 items-end max-w-2xl mx-auto">
            {podiumOrder.map((entry) => {
              const style = PODIUM_STYLES[entry.position as 1 | 2 | 3]
              const Icon = style.icon
              const isMe = entry.id === currentUserId
              return (
                <Card
                  key={entry.id}
                  className={`${style.bg} ${style.border} ${style.ring} ${style.height} text-center relative overflow-hidden`}
                >
                  {style.crown && (
                    <div className="absolute -top-1 left-0 right-0 text-center">
                      <Crown className="w-6 h-6 text-accent mx-auto fill-accent" />
                    </div>
                  )}
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-full ${style.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${style.iconColor}`} />
                  </div>
                  <p className={`font-display text-3xl mb-1 ${style.iconColor}`}>
                    {entry.position}
                  </p>
                  <p className="font-heading font-bold text-white text-sm truncate px-2">
                    {entry.name}
                    {isMe && <span className="ml-1 text-accent text-xs">(Tú)</span>}
                  </p>
                  <p className="font-mono text-2xl font-bold text-accent mt-2">
                    {entry.totalPoints}
                  </p>
                  <p className="text-xs text-text-secondary">pts</p>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* RESTO DEL RANKING (lista simple) */}
      {rest.length > 0 && (
        <div>
          <div className="border-t border-surface-light pt-6">
            <h3 className="font-heading text-sm uppercase tracking-wider text-text-secondary mb-4 px-2">
              Clasificación General
            </h3>
            <div className="space-y-2">
              {rest.map((entry) => {
                const isMe = entry.id === currentUserId
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg bg-surface/40 ${
                      isMe ? 'border border-accent/40 bg-accent/5' : 'border border-transparent'
                    }`}
                  >
                    {/* Posición */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                      <span className="font-mono font-bold text-text-secondary text-sm">
                        {entry.position}
                      </span>
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
                    <div className="hidden sm:flex items-center gap-3 text-xs">
                      <div className="text-center px-2">
                        <p className="font-mono font-semibold text-text-primary">
                          {entry.exactScores}
                        </p>
                        <p className="text-text-secondary">exactos</p>
                      </div>
                    </div>
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
