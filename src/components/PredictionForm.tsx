'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createPrediction, updatePrediction } from '@/actions/prediction-actions'
import type { Match } from '@/types'

interface PredictionFormProps {
  match: Match
  existingPrediction?: { id: string; homeGoals: number; awayGoals: number } | null
}

export function PredictionForm({ match, existingPrediction }: PredictionFormProps) {
  const router = useRouter()
  const [homeGoals, setHomeGoals] = useState<number | string>(existingPrediction?.homeGoals ?? '')
  const [awayGoals, setAwayGoals] = useState<number | string>(existingPrediction?.awayGoals ?? '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (existingPrediction) {
      setHomeGoals(existingPrediction.homeGoals)
      setAwayGoals(existingPrediction.awayGoals)
    }
  }, [existingPrediction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const home = Number(homeGoals)
    const away = Number(awayGoals)

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setError('Ingresa marcadores válidos')
      setIsLoading(false)
      return
    }

    if (home > 20 || away > 20) {
      setError('El marcador máximo es 20')
      setIsLoading(false)
      return
    }

    // Si ya existe una predicción, la actualizamos; si no, la creamos
    const result = existingPrediction
      ? await updatePrediction(existingPrediction.id, {
          homeGoals: home,
          awayGoals: away,
        })
      : await createPrediction({
          matchId: match.id,
          homeGoals: home,
          awayGoals: away,
        })

    if (!result.success) {
      setError(result.error || 'Error al guardar')
      setIsLoading(false)
      return
    }

    router.refresh()
    router.push('/predicciones')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          {match.homeTeam} vs {match.awayTeam}
        </h2>
        <p className="text-text-secondary">{match.group}</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 max-w-[140px]">
          <Input
            type="number"
            label={match.homeTeam}
            min={0}
            max={20}
            value={homeGoals}
            onChange={(e) => setHomeGoals(e.target.value)}
            placeholder="0"
            className="text-center text-2xl font-mono font-bold"
          />
        </div>

        <span className="text-3xl font-bold text-text-secondary pt-6">-</span>

        <div className="flex-1 max-w-[140px]">
          <Input
            type="number"
            label={match.awayTeam}
            min={0}
            max={20}
            value={awayGoals}
            onChange={(e) => setAwayGoals(e.target.value)}
            placeholder="0"
            className="text-center text-2xl font-mono font-bold"
          />
        </div>
      </div>

      {error && (
        <p className="text-center text-error text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="flex-1"
        >
          {existingPrediction ? 'Actualizar' : 'Guardar'} Predicción
        </Button>
      </div>

      <p className="text-center text-xs text-text-secondary">
        ⚠️ No podrás cambiar tu predicción una vez iniciado el partido
      </p>
    </form>
  )
}
