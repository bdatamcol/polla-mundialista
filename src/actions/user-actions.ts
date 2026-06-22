'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { RankingEntry } from '@/types'

const parentescoSchema = z
  .string()
  .max(80, 'El parentesco es demasiado largo')
  .transform((val) => (val && val.trim().length > 0 ? val.trim() : null))

export async function updateMyParentesco(parentesco: string) {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Debes iniciar sesion' }
  const validation = parentescoSchema.safeParse(parentesco)
  if (!validation.success) return { success: false, error: validation.error.errors[0].message }
  await prisma.user.update({
    where: { id: user.id },
    data: { parentesco: validation.data },
  })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getRanking(options?: { limit?: number; offset?: number }) {
  const limit = options?.limit ?? 50
  const offset = options?.offset ?? 0

  const users = await prisma.user.findMany({
    orderBy: [
      { totalPoints: 'desc' },
      // Desempate por cantidad de aciertos: correctWinners ya incluye
      // los marcadores exactos (porque isCorrectWinner = true cuando isExactScore = true)
      { correctWinners: 'desc' },
      { exactScores: 'desc' },
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
    // Aciertos = correctWinners (que ya cuenta exacto + ganador correcto)
    hits: user.correctWinners,
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
          correctWinners: { gt: user.correctWinners },
        },
        {
          totalPoints: user.totalPoints,
          correctWinners: user.correctWinners,
          exactScores: { gt: user.exactScores },
        },
        {
          totalPoints: user.totalPoints,
          correctWinners: user.correctWinners,
          exactScores: user.exactScores,
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
