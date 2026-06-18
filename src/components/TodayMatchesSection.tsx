import { Calendar } from 'lucide-react'
import { MatchCard } from '@/components/MatchCard'
import type { Match, Prediction } from '@/types'

interface TodayMatchesSectionProps {
  matches: Match[]
  predictions: Prediction[]
}

const months = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatTodayLong(): string {
  const d = new Date()
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}

export function TodayMatchesSection({ matches, predictions }: TodayMatchesSectionProps) {
  const predictionsByMatch = new Map(predictions.map((p) => [p.matchId, p]))

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl text-white">
            PARTIDOS DE <span className="text-accent">HOY</span>
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-text-secondary text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formatTodayLong()}</span>
          </div>
        </div>
        <span className="font-mono text-sm text-text-secondary">
          {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-xl border border-surface-light bg-surface/60 p-8 text-center">
          <p className="text-text-secondary">
            No hay partidos programados para hoy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {matches.map((match) => {
            const prediction = predictionsByMatch.get(match.id) ?? null
            return (
              <MatchCard
                key={match.id}
                match={match}
                prediction={prediction}
                userPrediction={
                  prediction
                    ? { homeGoals: prediction.homeGoals, awayGoals: prediction.awayGoals }
                    : null
                }
                showEditButton={true}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}