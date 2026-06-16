import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getFlagUrl } from '@/lib/flags'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeam: 'TBD' },
        { awayTeam: 'TBD' },
      ],
    },
    take: 0, // No TBDs
  })

  // Trae partidos reales (no TBD) y prueba getFlagUrl
  const realMatches = await prisma.match.findMany({
    where: {
      AND: [
        { homeTeam: { not: 'TBD' } },
        { awayTeam: { not: 'TBD' } },
      ],
    },
    take: 30,
    orderBy: { matchDate: 'asc' },
    select: {
      id: true,
      homeTeam: true,
      homeTeamFull: true,
      homeTeamTla: true,
      homeTeamIso2: true,
      awayTeam: true,
      awayTeamFull: true,
      awayTeamTla: true,
      awayTeamIso2: true,
    },
  })

  const sample = realMatches.map((m) => ({
    home: {
      name: m.homeTeam,
      full: m.homeTeamFull,
      tla: m.homeTeamTla,
      iso2: m.homeTeamIso2,
      resolvedUrl: getFlagUrl(m.homeTeamIso2, m.homeTeamTla, m.homeTeamFull || m.homeTeam),
    },
    away: {
      name: m.awayTeam,
      full: m.awayTeamFull,
      tla: m.awayTeamTla,
      iso2: m.awayTeamIso2,
      resolvedUrl: getFlagUrl(m.awayTeamIso2, m.awayTeamTla, m.awayTeamFull || m.awayTeam),
    },
  }))

  // Identifica los que no se resolvieron
  const noFlag = sample.filter((m) => !m.home.resolvedUrl || !m.away.resolvedUrl)

  return NextResponse.json({
    totalReviewed: sample.length,
    withIssues: noFlag.length,
    issues: noFlag,
    all: sample,
  })
}
