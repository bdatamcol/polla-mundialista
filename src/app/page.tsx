import Link from 'next/link'
import { Trophy, Users, Gift, TrendingUp, Clock, ArrowRight, Star } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PrizeCard } from '@/components/PrizeCard'
import { RankingTable } from '@/components/RankingTable'
import { UpcomingMatchHero } from '@/components/UpcomingMatchHero'
import { getPrizes } from '@/actions/admin-actions'
import { getTopUsers } from '@/actions/user-actions'
import { getNextMatch } from '@/actions/match-actions'
import { getCurrentUser } from '@/lib/auth'
import { maybeLazySyncResults } from '@/lib/lazy-sync'

export default async function HomePage() {
  // Disparar lazy sync en background (no bloquea la página)
  maybeLazySyncResults().catch(() => {})

  const [topUsers, nextMatch, user, prizes] = await Promise.all([
    getTopUsers(5),
    getNextMatch(),
    getCurrentUser(),
    getPrizes(),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary via-background to-background-dark">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent text-black px-4 py-2 rounded-full mb-6 shadow-lg shadow-accent/20">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Mundial 2026 - Estados Unidos, México, Canadá</span>
            </div>
            <div className="flex justify-center mb-6">
              <img 
                src="polla-mundialista.png" 
                alt="POLLA MUNDIALISTA" 
                className="w-56 h-56 md:w-72 md:h-72 drop-shadow-2xl animate-float" 
              />
            </div>
            

            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-8">
              Demuestra tu conocimiento futbolístico. Predice los resultados de todos los partidos 
              y lleva increíbles premios.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro" scroll>
                <Button size="lg" className="w-full sm:w-auto">
                  Participar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/reglamento">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Reglamento
                </Button>
              </Link>
            </div>
          </div>

          {!user && (
            <div className="mb-12">
              <h2 className="font-display text-3xl md:text-4xl text-center text-white mb-12">
                ¿CÓMO <span className="text-accent">PARTICIPAR</span>?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center card-hover">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="mb-2">1. Regístrate</CardTitle>
                  <p className="text-text-secondary text-sm">
                    Crea tu cuenta gratuita con tu correo electrónico y acepta los términos y condiciones.
                  </p>
                </Card>

                <Card className="text-center card-hover">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="mb-2">2. Predice</CardTitle>
                  <p className="text-text-secondary text-sm">
                    Selecciona los resultados de todos los partidos del Mundial antes de que inicien.
                  </p>
                </Card>

                <Card className="text-center card-hover">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="mb-2">3. Gana</CardTitle>
                  <p className="text-text-secondary text-sm">
                    Acumula puntos por cada acierto y compite por los premios del ranking.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Countdown */}
          {nextMatch && (
            <div className="mb-12">
              <UpcomingMatchHero match={nextMatch} />
            </div>
          )}
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-background"/>
          </svg>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-background to-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                <Gift className="h-4 w-4" />
                Premios Publicados
              </div>
              <h2 className="font-display text-3xl md:text-5xl text-white">
                PREMIOS <span className="text-accent">DESTACADOS</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-text-secondary">
                Estos premios se muestran directamente desde el módulo de administración y se actualizan según lo que publiques.
              </p>
            </div>
            <Link href="/premios">
              <Button variant="ghost" className="self-start md:self-auto">
                Ver Todos Los Premios
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {prizes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prizes.slice(0, 3).map((prize) => (
                <PrizeCard key={prize.id} prize={prize} />
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
                <Gift className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="mb-2">Premios Por Confirmar</CardTitle>
              <p className="mx-auto max-w-xl text-sm text-text-secondary">
                Aun no hay premios publicados desde administración. En cuanto se carguen, aparecerán aquí automáticamente.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Top Ranking Preview */}
      <section className="py-16 bg-gradient-to-b from-background via-background to-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                <Star className="h-4 w-4" />
                Competencia En Vivo
              </div>
              <h2 className="font-display text-3xl md:text-5xl text-white">
                TOP <span className="text-accent">RANKING</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-text-secondary">
                Mira a los jugadores más finos del torneo, su puntaje acumulado y quién está marcando el ritmo de la polla.
              </p>
            </div>
            <Link href="/ranking">
              <Button variant="ghost" className="self-start md:self-auto">
                Ver Ranking Completo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <RankingTable ranking={topUsers} />
        </div>
      </section>

    </div>
  )
}
