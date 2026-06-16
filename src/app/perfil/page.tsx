import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Calendar, Trophy, Target, Star, LogOut, ExternalLink } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RankingTable } from '@/components/RankingTable'
import { MatchCard } from '@/components/MatchCard'
import { getCurrentUser } from '@/lib/auth'
import { getUserPosition } from '@/actions/user-actions'
import { getPredictionStats, getUserPredictions } from '@/actions/prediction-actions'
import { getRanking } from '@/actions/user-actions'
import { formatDate } from '@/lib/utils'
import { logoutUser } from '@/actions/auth-actions'

export default async function PerfilPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const [position, stats, predictions, ranking] = await Promise.all([
    getUserPosition(user.id),
    getPredictionStats(user.id),
    getUserPredictions(user.id),
    getRanking({ limit: 100 }),
  ])

  const recentPredictions = predictions.slice(0, 5)
  const userRankEntry = ranking.find((r) => r.id === user.id)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            MI <span className="text-accent">PERFIL</span>
          </h1>
          <p className="text-text-secondary">
            Gestiona tu información y revisa tu historial de predicciones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-accent" />
                </div>
                <h2 className="font-heading text-xl font-semibold text-text-primary">
                  {user.name}
                </h2>
                <Badge variant={user.role === 'ADMIN' ? 'gold' : 'default'} className="mt-2">
                  {user.role === 'ADMIN' ? 'Administrador' : 'Participante'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-surface-light/50 rounded-lg">
                  <Mail className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm text-text-primary truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-light/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm text-text-primary">
                    Desde {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="mb-6">
              <CardTitle className="mb-4">Estadísticas</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-surface-light/50 rounded-lg">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <p className="font-mono text-2xl font-bold text-text-primary">
                    {user.totalPoints}
                  </p>
                  <p className="text-text-secondary text-xs">Puntos</p>
                </div>
                <div className="text-center p-3 bg-surface-light/50 rounded-lg">
                  <Target className="w-6 h-6 mx-auto mb-2 text-success" />
                  <p className="font-mono text-2xl font-bold text-text-primary">
                    {user.exactScores}
                  </p>
                  <p className="text-text-secondary text-xs">Exactos</p>
                </div>
                <div className="text-center p-3 bg-surface-light/50 rounded-lg">
                  <Star className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <p className="font-mono text-2xl font-bold text-text-primary">
                    {user.correctWinners}
                  </p>
                  <p className="text-text-secondary text-xs">Acertados</p>
                </div>
                <div className="text-center p-3 bg-surface-light/50 rounded-lg">
                  <User className="w-6 h-6 mx-auto mb-2 text-primary-light" />
                  <p className="font-mono text-2xl font-bold text-text-primary">
                    #{position}
                  </p>
                  <p className="text-text-secondary text-xs">Posición</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <CardTitle className="mb-4">Acciones</CardTitle>
              <div className="space-y-2">
                <Link href="/predicciones">
                  <Button variant="outline" className="w-full justify-start">
                    Mis Predicciones
                  </Button>
                </Link>
                <Link href="/ranking">
                  <Button variant="outline" className="w-full justify-start">
                    Ver Ranking
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <form action={async () => {
                  'use server'
                  await logoutUser()
                  redirect('/')
                }}>
                  <Button type="submit" variant="ghost" className="w-full justify-start text-error hover:bg-error/10">
                    <LogOut className="mr-2 w-4 h-4" />
                    Cerrar Sesión
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2">
            {/* Recent Predictions */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-white">
                  ÚLTIMAS <span className="text-accent">PREDICCIONES</span>
                </h3>
                <Link href="/predicciones">
                  <Button variant="ghost" size="sm">Ver Todas</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <MatchCard
                    key={prediction.id}
                    match={prediction.match}
                    prediction={prediction}
                    userPrediction={{
                      homeGoals: prediction.homeGoals,
                      awayGoals: prediction.awayGoals,
                    }}
                    showEditButton={false}
                  />
                ))}

                {recentPredictions.length === 0 && (
                  <Card className="text-center py-8">
                    <p className="text-text-secondary">
                      No has hecho predicciones aún.{' '}
                      <Link href="/predicciones" className="text-accent hover:underline">
                        Empieza aquí
                      </Link>
                    </p>
                  </Card>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
