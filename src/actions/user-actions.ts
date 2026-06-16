'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { RankingEntry } from '@/types'

export async function getRanking(options?: { limit?: number; offset?: number }) {
  const limit = options?.limit ?? 50
  const offset = options?.offset ?? 0

  const users = await prisma.user.findMany({
    orderBy: [
      { totalPoints: 'desc' },
      { exactScores: 'desc' },
      { correctWinners: 'desc' },
      { createdAt: 'asc' },
    ],
    select: {
      id: true,
      name: true,
      totalPoints: true,
      exactScores: true,
      correctWinners: true,
      createdAt: true,
      _count: {
        select: { predictions: true },
      },
    },
    take: limit,
    skip: offset,
  })

  const ranking: RankingEntry[] = users.map((user, index) => ({
    position: offset + index + 1,
    id: user.id,
    name: user.name,
    totalPoints: user.totalPoints,
    exactScores: user.exactScores,
    correctWinners: user.correctWinners,
    predictionsCount: user._count.predictions,
    createdAt: user.createdAt,
  }))

  return ranking
}

export async function getUserPosition(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalPoints: true,
      exactScores: true,
      correctWinners: true,
      createdAt: true,
    },
  })

  if (!user) return 0

  const higherOrEqualUsers = await prisma.user.count({
    where: {
      OR: [
        { totalPoints: { gt: user.totalPoints } },
        {
          totalPoints: user.totalPoints,
          exactScores: { gt: user.exactScores },
        },
        {
          totalPoints: user.totalPoints,
          exactScores: user.exactScores,
          correctWinners: { gt: user.correctWinners },
        },
        {
          totalPoints: user.totalPoints,
          exactScores: user.exactScores,
          correctWinners: user.correctWinners,
          createdAt: { gt: user.createdAt },
        },
      ],
    },
  })

  return higherOrEqualUsers + 1
}

export async function getTopUsers(limit: number = 5) {
  return getRanking({ limit })
}

export async function getTotalUsers() {
  return prisma.user.count()
}

export async function getTotalPredictions() {
  return prisma.prediction.count()
}
