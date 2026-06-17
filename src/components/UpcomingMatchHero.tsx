'use client'

import { useState } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'
import { CountdownSimple } from '@/components/Countdown'
import { getFlagEmoji, getFlagUrl } from '@/lib/flags'
import { formatDate, formatTime } from '@/lib/utils'
import type { Match } from '@/types'

interface UpcomingMatchHeroProps {
  match: Match
}

export function UpcomingMatchHero({ match }: UpcomingMatchHeroProps) {
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-text-secondary ring-1 ring-white/10">
        <Clock3 className="w-4 h-4 text-accent" />
        <span>Próximo partido</span>
      </div>

      <div className="mt-5 rounded-[28px] border border-accent/20 bg-background-dark/60 p-5 shadow-2xl shadow-primary-dark/30 backdrop-blur-md md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2 md:justify-between">
          <div className="rounded-full bg-white/8 px-4 py-1 text-sm text-text-secondary ring-1 ring-white/10">
            {match.group}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-text-secondary sm:text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              <CalendarDays className="w-4 h-4 text-accent" />
              <span>{formatDate(match.matchDate)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              <Clock3 className="w-4 h-4 text-accent" />
              <span>{formatTime(match.matchDate)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-5">
          <div className="min-w-0 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white/10 bg-white/10 shadow-lg shadow-primary-dark/20 md:h-24 md:w-24">
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
            <p className="max-w-[7rem] break-words font-heading text-lg font-bold leading-tight text-white md:max-w-[14rem] md:text-2xl">
              {match.homeTeam}
            </p>
            {match.homeTeamFull && match.homeTeamFull !== match.homeTeam && (
              <p className="mt-1 hidden text-sm text-text-secondary md:block">{match.homeTeamFull}</p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="rounded-full border border-accent/30 bg-accent px-4 py-2 font-display text-lg text-black shadow-lg shadow-accent/20 md:px-5 md:text-2xl">
              VS
            </div>
          </div>

          <div className="min-w-0 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white/10 bg-white/10 shadow-lg shadow-primary-dark/20 md:h-24 md:w-24">
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
            <p className="max-w-[7rem] break-words font-heading text-lg font-bold leading-tight text-white md:max-w-[14rem] md:text-2xl">
              {match.awayTeam}
            </p>
            {match.awayTeamFull && match.awayTeamFull !== match.awayTeam && (
              <p className="mt-1 hidden text-sm text-text-secondary md:block">{match.awayTeamFull}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <CountdownSimple targetDate={match.matchDate} />
        </div>
      </div>
    </div>
  )
}
