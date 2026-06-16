import { Trophy } from 'lucide-react'
import { RankingTable } from '@/components/RankingTable'
import { getRanking } from '@/actions/user-actions'
import { getCurrentUser } from '@/lib/auth'
import { maybeLazySyncResults } from '@/lib/lazy-sync'

export default async function RankingPage() {
  // Disparar lazy sync en background (no bloquea la página)
  maybeLazySyncResults().catch(() => {})

  const [ranking, user] = await Promise.all([
    getRanking({ limit: 100 }),
    getCurrentUser(),
  ])

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
            <Trophy className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            RANKING <span className="text-accent">GENERAL</span>
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Clasificación de todos los participantes ordenada por puntos. 
            Los marcadores exactos son el primer criterio de desempate.
          </p>
        </div>

        {/* Ranking Table */}
        <RankingTable ranking={ranking} currentUserId={user?.id} />
      </div>
    </div>
  )
}
