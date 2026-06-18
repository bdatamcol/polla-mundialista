import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Target, TrendingUp, Calendar, ArrowRight, Star } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RankingTable } from '@/components/RankingTable'
import { MatchCard } from '@/components/MatchCard'
import { CountdownSimple } from '@/components/Countdown'
import { TodayMatchesSection } from '@/components/TodayMatchesSection'
import { getCurrentUser } from '@/lib/auth'
import { maybeLazySyncResults } from '@/lib/lazy-sync'
import { getMyFinalistPrediction, isFinalistPredictionLocked } from '@/actions/finalist-actions'
import { getUserPosition } from '@/actions/user-actions'
import { getPredictionStats } from '@/actions/prediction-actions'
import { getMatches, getNextMatch, getTodayMatches } from '@/actions/match-actions'
import { getTopUsers } from '@/actions/user-actions'
import { getUserPredictions } from '@/actions/prediction-actions'
import { getFlagEmoji, getFlagUrl } from '@/lib/flags'
import { formatDateTime } from '@/lib/utils'

// Formatear fecha de forma fija en el servidor
function formatMatchDate(date: Date | string): string {
  const d = new Date(date)
  const day = d.getDate()
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} de ${month} ${year} - ${hours}:${minutes}`
}

function resolveTeamFlag(
  teamName: string,
  teamFull: string | null | undefined,
  teamIso2: string | null | undefined,
  teamTla: string | null | undefined
) {
  return {
    url: getFlagUrl(teamIso2, teamTla, teamFull || teamName),
    emoji: getFlagEmoji(teamTla),
    alt: teamFull || teamName,
  }
}

export default async function DashboardPage() {
  // Disparar lazy sync en background (no bloquea la página)
  maybeLazySyncResults().catch(() => {})

  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const [position, stats, nextMatch, topUsers, predictions, finalistPred, finalistLocked, todayMatches] = await Promise.all([
    getUserPosition(user.id),
    getPredictionStats(user.id),
    getNextMatch(),
    getTopUsers(5),
    getUserPredictions(user.id),
    getMyFinalistPrediction(),
    isFinalistPredictionLocked(),
    getTodayMatches(),
  ])

  // Get upcoming matches without predictions
  const matches = await getMatches({ status: 'PENDING' })
  const pendingMatchesWithoutPrediction = matches
    .filter((match) => {
      const now = new Date()
      return new Date(match.matchDate) > now && 
        !predictions.some((p: any) => p.matchId === match.id)
    })
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            HOLA, <span className="text-accent">{user.name.toUpperCase()}</span>
          </h1>
          <p className="text-text-secondary">
            Bienvenido a tu dashboard. Aquí está tu resumen de la Polla Mundialista.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <p className="font-mono text-3xl font-bold text-accent">{user.totalPoints}</p>
            <p className="text-text-secondary text-sm">Puntos Totales</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-light" />
            </div>
            <p className="font-mono text-3xl font-bold text-white">#{position}</p>
            <p className="text-text-secondary text-sm">Tu Posición</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-success" />
            </div>
            <p className="font-mono text-3xl font-bold text-white">{stats.exactScores}</p>
            <p className="text-text-secondary text-sm">Marcadores Exactos</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-secondary-light" />
            </div>
            <p className="font-mono text-3xl font-bold text-white">{stats.correctWinners}</p>
            <p className="text-text-secondary text-sm">Ganadores Acertados</p>
          </Card>
        </div>

        {/* Today's Matches - full width */}
        <TodayMatchesSection matches={todayMatches} predictions={predictions as any} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Next Match */}
            {nextMatch && (
              <section>
                {(() => {
                  const homeFlag = resolveTeamFlag(
                    nextMatch.homeTeam,
                    nextMatch.homeTeamFull,
                    nextMatch.homeTeamIso2,
                    nextMatch.homeTeamTla
                  )
                  const awayFlag = resolveTeamFlag(
                    nextMatch.awayTeam,
                    nextMatch.awayTeamFull,
                    nextMatch.awayTeamIso2,
                    nextMatch.awayTeamTla
                  )

                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-2xl text-white">
                          PRÓXIMO <span className="text-accent">PARTIDO</span>
                        </h2>
                      </div>
                      <Card className="border-accent/30">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="info">{nextMatch.group}</Badge>
                          <div className="flex items-center gap-2 text-text-secondary text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatMatchDate(nextMatch.matchDate)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-1 flex-col items-center text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-white/10 shadow-lg shadow-primary-dark/20">
                              {homeFlag.url ? (
                                <img
                                  src={homeFlag.url}
                                  alt={homeFlag.alt}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-4xl">{homeFlag.emoji}</span>
                              )}
                            </div>
                            <p className="font-heading font-bold text-xl text-text-primary">
                              {nextMatch.homeTeam}
                            </p>
                          </div>
                          <div className="px-4 py-2 bg-surface-light rounded-lg">
                            <span className="text-2xl font-mono text-accent">VS</span>
                          </div>
                          <div className="flex flex-1 flex-col items-center text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-white/10 shadow-lg shadow-primary-dark/20">
                              {awayFlag.url ? (
                                <img
                                  src={awayFlag.url}
                                  alt={awayFlag.alt}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-4xl">{awayFlag.emoji}</span>
                              )}
                            </div>
                            <p className="font-heading font-bold text-xl text-text-primary">
                              {nextMatch.awayTeam}
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 text-center">
                          <p className="text-text-secondary text-sm mb-3">Tiempo restante:</p>
                          <CountdownSimple targetDate={nextMatch.matchDate} />
                        </div>
                      </Card>
                    </>
                  )
                })()}
              </section>
            )}

            {/* Pending Predictions */}
            {/* Finalist Prediction Banner */}
            <section className="mb-6">
              <Link href="/predicciones/finalistas">
                <Card className={`cursor-pointer hover:border-accent/50 transition-all ${
                  finalistPred
                    ? 'border-success/30 bg-success/5'
                    : 'border-accent/30 bg-accent/5'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                      finalistPred ? 'bg-success/20' : 'bg-accent/20'
                    }`}>
                      {finalistLocked ? (
                        <Trophy className="w-7 h-7 text-text-secondary" />
                      ) : finalistPred ? (
                        <Trophy className="w-7 h-7 text-success" />
                      ) : (
                        <Star className="w-7 h-7 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg text-white">PREDICCIÓN DE FINALISTAS</h3>
                        {finalistLocked && <Badge variant="default">Cerrado</Badge>}
                        {finalistPred && !finalistLocked && <Badge variant="success">Completa</Badge>}
                      </div>
                      <p className="text-text-secondary text-sm mt-1">
                        {finalistLocked
                          ? 'Las predicciones están cerradas. Espera a que se calculen los puntos.'
                          : finalistPred
                          ? `Ya tienes tu predicción: ${finalistPred.semifinalPoints + finalistPred.finalPoints} pts calculados`
                          : 'Elige los 4 semifinalistas y los 2 finalistas. Hasta 80 pts extra.'}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            </section>

            {pendingMatchesWithoutPrediction.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl text-white">
                    PARTIDOS <span className="text-accent">SIN PREDECIR</span>
                  </h2>
                  <Link href="/predicciones">
                    <Button variant="ghost" size="sm">
                      Ver Todos
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingMatchesWithoutPrediction.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      showEditButton={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Predictions */}
            {predictions.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl text-white">
                    ÚLTIMAS <span className="text-accent">PREDICCIONES</span>
                  </h2>
                  <Link href="/predicciones">
                    <Button variant="ghost" size="sm">
                      Ver Todas
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictions.slice(0, 4).map((prediction: any) => (
                    <MatchCard
                      key={prediction.id}
                      match={prediction.match}
                      prediction={prediction}
                      userPrediction={{
                        homeGoals: prediction.homeGoals,
                        awayGoals: prediction.awayGoals,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Mini Ranking */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-white">
                  TOP <span className="text-accent">5</span>
                </h2>
                <Link href="/ranking">
                  <Button variant="ghost" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>
              <RankingTable ranking={topUsers} currentUserId={user.id} variant="compact" />
            </section>

            {/* Quick Stats */}
            <Card>
              <CardTitle className="mb-4">Tu Estadísticas</CardTitle>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Total predicciones</span>
                  <span className="font-mono font-bold text-text-primary">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Pendientes</span>
                  <span className="font-mono font-bold text-warning">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Puntuadas</span>
                  <span className="font-mono font-bold text-success">{stats.scored}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
