import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Solo admin
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const matches = await prisma.match.findMany({
    take: 10,
    orderBy: { matchDate: 'asc' },
    select: {
      id: true,
      externalId: true,
      homeTeam: true,
      homeTeamTla: true,
      homeTeamIso2: true,
      awayTeam: true,
      awayTeamTla: true,
      awayTeamIso2: true,
      homeTeamCrest: true,
      group: true,
      phase: true,
      matchDate: true,
      status: true,
    },
  })

  const total = await prisma.match.count()
  const tbdCount = await prisma.match.count({
    where: {
      OR: [
        { homeTeam: 'TBD' },
        { awayTeam: 'TBD' },
      ],
    },
  })
  const withIso2 = await prisma.match.count({
    where: {
      AND: [
        { homeTeamIso2: { not: null } },
        { awayTeamIso2: { not: null } },
      ],
    },
  })

  return NextResponse.json({
    total,
    tbdCount,
    withIso2,
    sample: matches,
  })
}
