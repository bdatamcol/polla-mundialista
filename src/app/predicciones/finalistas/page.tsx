import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Medal, Lock, Info } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import {
  getMyFinalistPrediction,
  getAvailableTeams,
  isFinalistPredictionLocked,
} from '@/actions/finalist-actions'
import { FinalistForm } from '@/components/FinalistForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default async function FinalistasPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const [prediction, teams, locked] = await Promise.all([
    getMyFinalistPrediction(),
    getAvailableTeams(),
    isFinalistPredictionLocked(),
  ])

  // Valores iniciales
  const initialPicks = {
    semifinalists: [
      prediction?.semifinalist1 || '',
      prediction?.semifinalist2 || '',
      prediction?.semifinalist3 || '',
      prediction?.semifinalist4 || '',
    ],
    finalists: [prediction?.finalist1 || '', prediction?.finalist2 || ''],
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-text-secondary hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl text-white">
            PREDICCIÓN DE <span className="text-accent">FINALISTAS</span>
          </h1>
        </div>
        <p className="text-text-secondary mb-8">
          Elige qué 4 equipos crees que llegarán a las semifinales y qué 2 jugarán la final.
        </p>

        {/* Estado de cierre */}
        <Card className={`mb-6 ${locked ? 'border-error/30 bg-error/5' : 'border-success/30 bg-success/5'}`}>
          <div className="flex items-start gap-3">
            {locked ? (
              <Lock className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-heading font-bold text-white mb-1">
                {locked ? 'Predicciones Cerradas' : 'Predicciones Abiertas'}
              </h3>
              <p className="text-text-secondary text-sm">
                {locked
                  ? 'Las predicciones de finalistas se cierran cuando comienza el primer partido de Octavos de Final.'
                  : 'Puedes modificar tu predicción hasta que comience el primer partido de Octavos de Final.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Sistema de puntos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/30 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-mono text-2xl font-bold text-primary-light">10 pts</p>
            <p className="text-xs text-text-secondary">por semifinalista correcto</p>
            <Badge variant="default" className="mt-2">4 selecciones</Badge>
          </Card>
          <Card className="border-accent/30 text-center glow-accent">
            <Medal className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="font-mono text-2xl font-bold text-accent">20 pts</p>
            <p className="text-xs text-text-secondary">por finalista correcto</p>
            <Badge variant="warning" className="mt-2">2 selecciones</Badge>
          </Card>
          <Card className="border-success/30 text-center">
            <Trophy className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="font-mono text-2xl font-bold text-success">5 pts</p>
            <p className="text-xs text-text-secondary">por marcador exacto</p>
            <Badge variant="success" className="mt-2">por partido</Badge>
          </Card>
        </div>

        {/* Puntos actuales del usuario (si ya se calcularon) */}
        {prediction && (prediction.semifinalPoints > 0 || prediction.finalPoints > 0) && (
          <Card className="mb-6 border-accent/30 bg-accent/5">
            <h3 className="font-heading font-bold text-accent mb-2">Tu progreso</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-mono text-2xl font-bold text-white">
                  {prediction.semisCorrect}/4
                </p>
                <p className="text-xs text-text-secondary">Semifinalistas correctos</p>
                <p className="text-sm text-accent mt-1">+{prediction.semifinalPoints} pts</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-white">
                  {prediction.finalsCorrect}/2
                </p>
                <p className="text-xs text-text-secondary">Finalistas correctos</p>
                <p className="text-sm text-accent mt-1">+{prediction.finalPoints} pts</p>
              </div>
            </div>
          </Card>
        )}

        {/* Formulario */}
        {teams.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">
                Aún no hay equipos disponibles. Sincroniza los partidos del Mundial desde el panel de admin.
              </p>
              <Link href="/admin/sync">
                <Button variant="outline">Ir a Sincronización</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <FinalistForm
            teams={teams}
            initialPicks={initialPicks}
            locked={locked}
            hasExistingPrediction={!!prediction}
          />
        )}
      </div>
    </div>
  )
}
