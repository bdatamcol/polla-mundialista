import Link from 'next/link'
import { Trophy, Users, Gift, TrendingUp, Calendar, Clock, ArrowRight, Star, Target } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RankingTable } from '@/components/RankingTable'
import { UpcomingMatchHero } from '@/components/UpcomingMatchHero'
import { getTopUsers } from '@/actions/user-actions'
import { getNextMatch } from '@/actions/match-actions'
import { formatDateTime } from '@/lib/utils'
import { maybeLazySyncResults } from '@/lib/lazy-sync'

export default async function HomePage() {
  const [topUsers, nextMatch] = await Promise.all([
    getTopUsers(5),
    getNextMatch(),
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

            <h1 className="font-display text-5xl md:text-7xl text-white mb-4">
              POLLA <span className="text-gradient">MUNDIALISTA</span>
            </h1>

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

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </section>

      {/* Points System */}
        <section className="py-16 bg-gradient-to-b from-background to-surface-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl md:text-4xl text-center text-white mb-4">
              SISTEMA DE <span className="text-accent">PUNTOS</span>
            </h2>
            <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
              Solo se otorgan puntos si aciertas el marcador exacto. A mayor fase, mayor la recompensa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center border-accent/30">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-accent">5</span>
                </div>
                <CardTitle className="text-accent mb-2">Fase 1</CardTitle>
                <p className="text-text-secondary text-sm">
                  Grupos + Octavos de final
                </p>
              </Card>

              <Card className="text-center border-primary-light/40">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light/25 flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-white">10</span>
                </div>
                <CardTitle className="text-white mb-2">Fase 2</CardTitle>
                <p className="text-text-secondary text-sm">
                  Cuartos + Semifinales
                </p>
              </Card>

            <Card className="text-center border-accent/30 glow-accent">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <p className="font-mono text-3xl font-bold text-accent mb-2">20 pts</p>
              <p className="text-text-secondary text-sm">
                Por finalista
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Por cada equipo correcto (2)
              </p>
            </Card>
          </div>

          <p className="text-center text-text-secondary text-sm mt-8 max-w-2xl mx-auto">
            <strong className="text-white">Importante:</strong> Si fallas el marcador de un partido, no sumas puntos.
            Para finalistas, sumas por cada equipo correctamente seleccionado.
          </p>
        </div>
      </section>

      {/* Top Ranking Preview */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-white">
              TOP <span className="text-accent">RANKING</span>
            </h2>
            <Link href="/ranking">
              <Button variant="ghost">
                Ver Ranking Completo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <RankingTable ranking={topUsers} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-dark via-primary to-primary-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
            ¿LISTO PARA EL MUNDIAL?
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Únete a la competencia más grande de predicciones del Mundial 2026.
          </p>
          <Link href="/registro" scroll>
            <Button size="lg" className="animate-pulse-glow">
              <Calendar className="mr-2 w-5 h-5" />
              Regístrate Ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
