import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Clock3 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PredictionForm } from '@/components/PredictionForm'
import { getCurrentUser } from '@/lib/auth'
import { getMatch } from '@/actions/match-actions'
import { getPrediction } from '@/actions/prediction-actions'
import { formatDate, formatTime } from '@/lib/utils'

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
    <div className="min-h-screen bg-background py-8 md:py-9">
      <div className="mx-auto max-w-lg px-4 sm:px-6 md:max-w-2xl lg:px-8">
        {/* Back Button */}
        <Link href="/predicciones" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Predicciones
        </Link>

        {/* Form Card */}
        <Card className="glow-accent md:px-7 md:py-7">
          <div className="mb-6 md:mb-7">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/6 via-primary-light/10 to-white/6 px-4 py-4 shadow-lg shadow-primary-dark/10">
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto whitespace-nowrap md:gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-medium text-text-secondary md:gap-2 md:px-3 md:text-sm">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  <span>{formatDate(match.matchDate)}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-medium text-text-secondary md:gap-2 md:px-3 md:text-sm">
                  <Clock3 className="h-4 w-4 text-accent" />
                  <span>{formatTime(match.matchDate)}</span>
                </div>
                <div className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-2.5 py-2 text-[11px] font-semibold text-accent md:px-3 md:text-sm">
                  {match.group}
                </div>
              </div>
            </div>
          </div>

          <PredictionForm
            match={match}
            existingPrediction={
              existingPrediction
                ? {
                    id: existingPrediction.id,
                    homeGoals: existingPrediction.homeGoals,
                    awayGoals: existingPrediction.awayGoals,
                  }
                : null
            }
          />
        </Card>
      </div>
    </div>
  )
}
