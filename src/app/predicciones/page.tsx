import { redirect } from 'next/navigation'
import { Calendar, Filter } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MatchCard } from '@/components/MatchCard'
import { getCurrentUser } from '@/lib/auth'
import { getMatches, getMatchesByGroup } from '@/actions/match-actions'
import { getUserPredictions } from '@/actions/prediction-actions'
import { isMatchLocked } from '@/lib/utils'

export default async function PrediccionesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const [matches, predictions] = await Promise.all([
    getMatches(),
    getUserPredictions(user.id),
  ])

  const predictionsByMatch = new Map(
    predictions.map((p) => [p.matchId, p])
  )

  const groupedMatches = await getMatchesByGroup()
  const groups = Object.keys(groupedMatches).sort((a, b) => {
    // Sort groups: Grupo A, B, C... then Octavos, Cuartos, Semifinales, Final
    const order = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H', 'Octavos de final', 'Cuartos de final', 'Semifinal', 'Tercer lugar', 'Final']
    return order.indexOf(a) - order.indexOf(b)
  })

  const stats = {
    total: predictions.length,
    pending: predictions.filter((p) => p.match.status === 'PENDING').length,
    scored: predictions.filter((p) => p.points > 0).length,
    exactScores: predictions.filter((p) => p.isExactScore).length,
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            MIS <span className="text-accent">PREDICCIONES</span>
          </h1>
          <p className="text-text-secondary">
            Gestiona tus predicciones para todos los partidos del Mundial 2026.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <p className="font-mono text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-text-secondary text-sm">Total</p>
          </Card>
          <Card className="text-center">
            <p className="font-mono text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-text-secondary text-sm">Pendientes</p>
          </Card>
          <Card className="text-center">
            <p className="font-mono text-2xl font-bold text-success">{stats.scored}</p>
            <p className="text-text-secondary text-sm">Puntuadas</p>
          </Card>
          <Card className="text-center">
            <p className="font-mono text-2xl font-bold text-accent">{stats.exactScores}</p>
            <p className="text-text-secondary text-sm">Exactas</p>
          </Card>
        </div>

        {/* Matches by Group */}
        <div className="space-y-8">
          {groups.map((group) => {
            const groupMatches = groupedMatches[group]
            return (
              <section key={group}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-accent" />
                  <h2 className="font-display text-xl text-white">{group.toUpperCase()}</h2>
                  <Badge variant="default">{groupMatches.length} partidos</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupMatches.map((match) => {
                    const prediction = predictionsByMatch.get(match.id)
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
                      />
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {matches.length === 0 && (
          <Card className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-light flex items-center justify-center">
              <Calendar className="w-8 h-8 text-text-secondary" />
            </div>
            <CardTitle className="mb-2">No hay partidos disponibles</CardTitle>
            <p className="text-text-secondary">
              Los partidos del Mundial 2026 se irán agregando pronto. ¡Mantente atento!
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
