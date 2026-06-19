'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createPrediction, updatePrediction } from '@/actions/prediction-actions'
import { getFlagUrl, getFlagEmoji } from '@/lib/flags'
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
  const [homeFlagError, setHomeFlagError] = useState(false)
  const [awayFlagError, setAwayFlagError] = useState(false)

  const homeFlagUrl =
    match.homeTeamCrest ||
    getFlagUrl(match.homeTeamIso2, match.homeTeamTla, match.homeTeamFull || match.homeTeam)
  const awayFlagUrl =
    match.awayTeamCrest ||
    getFlagUrl(match.awayTeamIso2, match.awayTeamTla, match.awayTeamFull || match.awayTeam)

  const homeEmoji = getFlagEmoji(match.homeTeamTla)
  const awayEmoji = getFlagEmoji(match.awayTeamTla)

  useEffect(() => {
    if (existingPrediction) {
      setHomeGoals(existingPrediction.homeGoals)
      setAwayGoals(existingPrediction.awayGoals)
    }
  }, [existingPrediction])

  const getTeamNameClass = (teamName: string) => {
    if (teamName.length >= 20) {
      return 'text-[8px] sm:text-sm md:text-base'
    }

    if (teamName.length >= 16) {
      return 'text-[10px] sm:text-sm md:text-lg'
    }

    return 'text-[clamp(11px,3.2vw,18px)] sm:text-base md:text-lg'
  }

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
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-primary-light/10 via-primary/10 to-background-dark/40 p-4 shadow-xl shadow-primary-dark/20 sm:p-6 md:p-7">
        <div className="mb-5 text-center md:mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-text-secondary">
            Ingresa el marcador exacto
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] sm:gap-5 md:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] md:gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-center sm:p-4 md:rounded-3xl md:p-5">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface-light shadow-lg shadow-primary-dark/10 sm:h-20 sm:w-20 md:mb-4 md:h-24 md:w-24">
              {homeFlagUrl && !homeFlagError ? (
                <img
                  src={homeFlagUrl}
                  alt={match.homeTeamFull || match.homeTeam}
                  className="h-full w-full object-cover"
                  onError={() => setHomeFlagError(true)}
                />
              ) : (
                <span className="text-4xl md:text-5xl">{homeEmoji}</span>
              )}
            </div>
            <p className={`mb-3 whitespace-nowrap px-1 font-heading font-bold leading-tight tracking-tight text-text-primary ${getTeamNameClass(match.homeTeam)}`}>
              {match.homeTeam}
            </p>
            <Input
              id={`home-goals-${match.id}`}
              aria-label={`Marcador de ${match.homeTeam}`}
              type="number"
              min={0}
              max={20}
              inputMode="numeric"
              value={homeGoals}
              onChange={(e) => setHomeGoals(e.target.value)}
              placeholder="0"
              className="h-14 rounded-xl border-accent/20 bg-background text-center font-mono text-3xl font-bold md:h-14 md:text-3xl"
            />
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full border border-accent/30 bg-accent px-2.5 py-2 font-display text-sm text-black shadow-lg shadow-accent/20 sm:px-4 sm:text-lg md:px-5 md:py-2.5 md:text-base">
              VS
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-center sm:p-4 md:rounded-3xl md:p-5">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface-light shadow-lg shadow-primary-dark/10 sm:h-20 sm:w-20 md:mb-4 md:h-24 md:w-24">
              {awayFlagUrl && !awayFlagError ? (
                <img
                  src={awayFlagUrl}
                  alt={match.awayTeamFull || match.awayTeam}
                  className="h-full w-full object-cover"
                  onError={() => setAwayFlagError(true)}
                />
              ) : (
                <span className="text-4xl md:text-5xl">{awayEmoji}</span>
              )}
            </div>
            <p className={`mb-3 whitespace-nowrap px-1 font-heading font-bold leading-tight tracking-tight text-text-primary ${getTeamNameClass(match.awayTeam)}`}>
              {match.awayTeam}
            </p>
            <Input
              id={`away-goals-${match.id}`}
              aria-label={`Marcador de ${match.awayTeam}`}
              type="number"
              min={0}
              max={20}
              inputMode="numeric"
              value={awayGoals}
              onChange={(e) => setAwayGoals(e.target.value)}
              placeholder="0"
              className="h-14 rounded-xl border-accent/20 bg-background text-center font-mono text-3xl font-bold md:h-14 md:text-3xl"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-center text-error text-sm">{error}</p>
      )}

      <div className="flex gap-3 md:mx-auto md:max-w-lg">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1 md:h-11 md:text-base"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="flex-1 whitespace-nowrap px-3 text-sm sm:px-4 sm:text-base md:h-11 md:text-base"
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
