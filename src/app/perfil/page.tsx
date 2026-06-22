import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Target, Star } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MatchCard } from '@/components/MatchCard'
import { MyPredictionsTable } from '@/components/MyPredictionsTable'
import { getCurrentUser } from '@/lib/auth'
import { getPredictionStats, getUserPredictions, getMyPredictionsPaginated } from '@/actions/prediction-actions'

export default async function PerfilPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const [stats, predictions, paginated] = await Promise.all([
    getPredictionStats(user.id),
    getUserPredictions(user.id),
    getMyPredictionsPaginated({ page: 1, pageSize: 20 }),
  ])

  const recentPredictions = predictions.slice(0, 5)

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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1">
            {/* Stats */}
            <Card className="overflow-hidden border-accent/25 bg-gradient-to-br from-primary-dark via-primary to-primary-light lg:sticky lg:top-24">
              <div className="relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,0,0.18),transparent_45%)]" />
                <div className="relative p-5">
                  <CardTitle className="mb-5 text-center text-white">Estadísticas</CardTitle>

                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/35 bg-accent/15 shadow-lg shadow-accent/10">
                      <Trophy className="h-7 w-7 text-accent" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.42em] text-accent/90">
                      Tus Puntos
                    </p>
                    <p className="mt-3 font-mono text-5xl font-bold leading-none text-white">
                      {user.totalPoints}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                        <Star className="h-5 w-5 text-accent" />
                      </div>
                      <p className="font-mono text-3xl font-bold text-white">{stats.correctWinners}</p>
                      <p className="mt-1 text-sm text-text-secondary">Acertados</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success/20">
                        <Target className="h-5 w-5 text-success" />
                      </div>
                      <p className="font-mono text-3xl font-bold text-white">{stats.exactScores}</p>
                      <p className="mt-1 text-sm text-text-secondary">Exactos</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Activity */}
          <div className="min-w-0">
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

            {/* Tabla paginada de predicciones */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-white">
                  HISTORIAL <span className="text-accent">DE PREDICCIONES</span>
                </h3>
              </div>
              <MyPredictionsTable initialData={paginated} />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
