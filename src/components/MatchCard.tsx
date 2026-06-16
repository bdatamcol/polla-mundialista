'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime, isMatchLocked } from '@/lib/utils'
import { getFlagUrl, getFlagEmoji } from '@/lib/flags'
import type { Match, Prediction } from '@/types'

interface MatchCardProps {
  match: Match
  prediction?: Prediction | null
  userPrediction?: { homeGoals: number; awayGoals: number } | null
  showEditButton?: boolean
}

export function MatchCard({ match, prediction, userPrediction, showEditButton = true }: MatchCardProps) {
  const [isLocked, setIsLocked] = useState(false)
  const [homeFlagError, setHomeFlagError] = useState(false)
  const [awayFlagError, setAwayFlagError] = useState(false)

  useEffect(() => {
    setIsLocked(isMatchLocked(match.matchDate, match.status))
  }, [match.matchDate, match.status])

  const statusConfig = {
    PENDING: { label: 'Pendiente', variant: 'success' as const },
    LIVE: { label: 'En Vivo', variant: 'warning' as const },
    FINISHED: { label: 'Finalizado', variant: 'default' as const },
  }

  const status = statusConfig[match.status]

  // Resolver URL de bandera con múltiples fallbacks: crest API > iso2 BD > TLA > nombre
  const homeFlagUrl =
    match.homeTeamCrest ||
    getFlagUrl(match.homeTeamIso2, match.homeTeamTla, match.homeTeamFull || match.homeTeam)
  const awayFlagUrl =
    match.awayTeamCrest ||
    getFlagUrl(match.awayTeamIso2, match.awayTeamTla, match.awayTeamFull || match.awayTeam)

  // Fallback a emoji
  const homeEmoji = getFlagEmoji(match.homeTeamTla)
  const awayEmoji = getFlagEmoji(match.awayTeamTla)

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        {match.group && !match.group.toLowerCase().includes('grupo') && (
          <span className="text-xs text-text-secondary">{match.group}</span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-surface-light flex items-center justify-center overflow-hidden">
            {homeFlagUrl && !homeFlagError ? (
              <img
                src={homeFlagUrl}
                alt={match.homeTeamFull || match.homeTeam}
                className="w-full h-full object-cover"
                onError={() => setHomeFlagError(true)}
              />
            ) : (
              <span className="text-3xl">{homeEmoji}</span>
            )}
          </div>
          <p className="font-heading font-bold text-text-primary text-sm">
            {match.homeTeam}
          </p>
        </div>

        <div className="flex flex-col items-center">
          {match.status === 'FINISHED' && match.homeGoals !== null ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-3xl font-bold text-accent">{match.homeGoals}</span>
              <span className="text-text-secondary">-</span>
              <span className="font-mono text-3xl font-bold text-accent">{match.awayGoals}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl text-text-secondary">?</span>
              <span className="text-text-secondary">-</span>
              <span className="font-mono text-2xl text-text-secondary">?</span>
            </div>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-surface-light flex items-center justify-center overflow-hidden">
            {awayFlagUrl && !awayFlagError ? (
              <img
                src={awayFlagUrl}
                alt={match.awayTeamFull || match.awayTeam}
                className="w-full h-full object-cover"
                onError={() => setAwayFlagError(true)}
              />
            ) : (
              <span className="text-3xl">{awayEmoji}</span>
            )}
          </div>
          <p className="font-heading font-bold text-text-primary text-sm">
            {match.awayTeam}
          </p>
        </div>
      </div>

      {/* User Prediction */}
      {userPrediction && (
        <div className="bg-surface-light/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-text-secondary text-center mb-1">Tu predicción</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-lg font-bold text-white">
              {userPrediction.homeGoals}
            </span>
            <span className="text-text-secondary">-</span>
            <span className="font-mono text-lg font-bold text-white">
              {userPrediction.awayGoals}
            </span>
          </div>
          {prediction?.points !== undefined && prediction.points > 0 && (
            <p className="text-center text-sm text-accent mt-1">
              +{prediction.points} puntos
            </p>
          )}
        </div>
      )}

      {/* Date/Time */}
      <div className="flex items-center justify-center gap-4 text-text-secondary text-sm mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(match.matchDate)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatTime(match.matchDate)}</span>
        </div>
      </div>

      {/* Action */}
      {showEditButton && !isLocked && match.status === 'PENDING' && (
        <Link href={`/predicciones/${match.id}`} className="block">
          <Button className="w-full" variant={userPrediction ? 'outline' : 'primary'}>
            {userPrediction ? 'Editar Predicción' : 'Hacer Predicción'}
          </Button>
        </Link>
      )}

      {isLocked && !userPrediction && (
        <div className="text-center text-text-secondary text-sm">
          Predicciones cerradas
        </div>
      )}

      {/* Locked indicator */}
      {isLocked && (
        <div className="absolute top-0 right-0 bg-surface-light px-3 py-1 rounded-bl-lg">
          <span className="text-xs text-text-secondary">🔒 Cerrado</span>
        </div>
      )}
    </Card>
  )
}
