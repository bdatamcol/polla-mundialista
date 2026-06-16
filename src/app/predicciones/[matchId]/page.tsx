import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PredictionForm } from '@/components/PredictionForm'
import { getCurrentUser } from '@/lib/auth'
import { getMatch } from '@/actions/match-actions'
import { getPrediction } from '@/actions/prediction-actions'
import { formatDateTime } from '@/lib/utils'

interface PageProps {
  params: Promise<{ matchId: string }>
}

export default async function EditPredictionPage({ params }: PageProps) {
  const { matchId } = await params
  const [user, match, existingPrediction] = await Promise.all([
    getCurrentUser(),
    getMatch(matchId),
    getCurrentUser().then((u) => u ? getPrediction(u.id, matchId) : null),
  ])

  if (!user) {
    redirect('/login')
  }

  if (!match) {
    notFound()
  }

  const now = new Date()
  const matchDate = new Date(match.matchDate)
  if (matchDate <= now || match.status !== 'PENDING') {
    redirect('/predicciones')
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/predicciones" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Predicciones
        </Link>

        {/* Form Card */}
        <Card className="glow-accent">
          <div className="mb-6 text-center">
            <p className="text-text-secondary text-sm mb-2">
              {formatDateTime(match.matchDate)}
            </p>
            <p className="text-accent text-sm">{match.group}</p>
          </div>

          <PredictionForm
            match={match}
            existingPrediction={
              existingPrediction
                ? { homeGoals: existingPrediction.homeGoals, awayGoals: existingPrediction.awayGoals }
                : null
            }
          />
        </Card>
      </div>
    </div>
  )
}
