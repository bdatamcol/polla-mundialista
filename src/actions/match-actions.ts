'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { MatchStatusType } from '@/types'

// Filtro base para excluir partidos TBD (To Be Determined) que aún no tienen equipos asignados
const TBD_FILTER = {
  NOT: {
    OR: [
      { homeTeam: 'TBD' },
      { awayTeam: 'TBD' },
      { homeTeamFull: 'TBD' },
      { awayTeamFull: 'TBD' },
    ],
  },
}

export async function getMatches(filters?: { status?: MatchStatusType; group?: string }) {
  return prisma.match.findMany({
    where: {
      ...TBD_FILTER,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.group && { group: filters.group }),
    },
    orderBy: { matchDate: 'asc' },
    include: {
      _count: {
        select: { predictions: true },
      },
    },
  })
}

export async function getMatch(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: {
      predictions: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })
}

export async function getNextMatch() {
  const now = new Date()
  return prisma.match.findFirst({
    where: {
      ...TBD_FILTER,
      status: 'PENDING',
      matchDate: { gt: now },
    },
    orderBy: { matchDate: 'asc' },
  })
}

export async function getMatchesByGroup() {
  const matches = await prisma.match.findMany({
    where: TBD_FILTER,
    orderBy: [{ group: 'asc' }, { matchDate: 'asc' }],
  })

  const grouped: Record<string, typeof matches> = {}
  for (const match of matches) {
    if (!grouped[match.group]) {
      grouped[match.group] = []
    }
    grouped[match.group].push(match)
  }

  return grouped
}

export async function createMatch(data: {
  homeTeam: string
  awayTeam: string
  group: string
  matchDate: string
}) {
  const match = await prisma.match.create({
    data: {
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      group: data.group,
      matchDate: new Date(data.matchDate),
    },
  })

  revalidatePath('/admin/partidos')
  revalidatePath('/admin/resultados')
  revalidatePath('/predicciones')

  return match
}

export async function updateMatch(
  id: string,
  data: {
    homeTeam?: string
    awayTeam?: string
    group?: string
    matchDate?: string
    status?: MatchStatusType
  }
) {
  const match = await prisma.match.update({
    where: { id },
    data: {
      ...(data.homeTeam && { homeTeam: data.homeTeam }),
      ...(data.awayTeam && { awayTeam: data.awayTeam }),
      ...(data.group && { group: data.group }),
      ...(data.matchDate && { matchDate: new Date(data.matchDate) }),
      ...(data.status && { status: data.status }),
    },
  })

  revalidatePath('/admin/partidos')
  revalidatePath('/admin/resultados')
  revalidatePath('/predicciones')

  return match
}

export async function deleteMatch(id: string) {
  await prisma.match.delete({
    where: { id },
  })

  revalidatePath('/admin/partidos')
  revalidatePath('/admin/resultados')
  revalidatePath('/predicciones')
}

export async function getTodayMatches() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  return prisma.match.findMany({
    where: {
      ...TBD_FILTER,
      matchDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { matchDate: 'asc' },
  })
}

export async function getPendingMatches() {
  return prisma.match.findMany({
    where: {
      ...TBD_FILTER,
      status: 'PENDING',
    },
    orderBy: { matchDate: 'asc' },
  })
}

export async function getFinishedMatches() {
  return prisma.match.findMany({
    where: {
      ...TBD_FILTER,
      status: 'FINISHED',
    },
    orderBy: { matchDate: 'desc' },
  })
}
