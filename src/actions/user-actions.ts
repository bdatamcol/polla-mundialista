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

  // Para cada usuario, obtener su snapshot más reciente (anterior al actual)
  // para calcular la tendencia.
  const userIds = users.map((u) => u.id)
  const previousSnapshots = userIds.length
    ? await prisma.userPositionSnapshot.findMany({
        where: {
          userId: { in: userIds },
          // Excluir snapshots tomados en los últimos 5 minutos (sería el "actual")
          takenAt: { lt: new Date(Date.now() - 5 * 60 * 1000) },
        },
        orderBy: { takenAt: 'desc' },
        distinct: ['userId'],
        select: { userId: true, position: true },
      })
    : []
  const previousByUser = new Map<string, number>(
    previousSnapshots.map((s) => [s.userId, s.position])
  )

  const ranking: RankingEntry[] = users.map((user, index) => {
    const currentPosition = offset + index + 1
    const previousPosition: number | null = previousByUser.get(user.id) ?? null
    let direction: 'UP' | 'DOWN' | 'SAME' | 'NEW' = 'NEW'
    let delta: number | null = null
    if (previousPosition !== null) {
      delta = previousPosition - currentPosition // positivo = subió (de 5 a 2 = +3)
      if (delta > 0) direction = 'UP'
      else if (delta < 0) direction = 'DOWN'
      else direction = 'SAME'
    }
    return {
      position: currentPosition,
      id: user.id,
      name: user.name,
      totalPoints: user.totalPoints,
      exactScores: user.exactScores,
      correctWinners: user.correctWinners,
      // Aciertos = correctWinners (que ya cuenta exacto + ganador correcto)
      hits: user.correctWinners,
      predictionsCount: user._count.predictions,
      createdAt: user.createdAt,
      trend: { previousPosition, delta, direction },
    }
  })

  return ranking
}

/**
 * Toma un snapshot de las posiciones actuales de todos los usuarios.
 * Llamar después de recalcular puntos o sincronizar resultados.
 */
export async function takeRankingSnapshot() {
  const users = await prisma.user.findMany({
    orderBy: [
      { totalPoints: 'desc' },
      { correctWinners: 'desc' },
      { exactScores: 'desc' },
      { createdAt: 'asc' },
    ],
    select: { id: true, totalPoints: true },
  })

  if (users.length === 0) return { success: true, count: 0 }

  // createMany no retorna los ids pero sí crea en batch
  await prisma.userPositionSnapshot.createMany({
    data: users.map((u, idx) => ({
      userId: u.id,
      position: idx + 1,
      totalPoints: u.totalPoints,
    })),
  })

  return { success: true, count: users.length }
}

/**
 * Limpia snapshots antiguos para no acumular datos innecesarios.
 * Conserva solo los últimos N snapshots por usuario.
 */
export async function pruneOldSnapshots(keepPerUser: number = 20) {
  const users = await prisma.user.findMany({ select: { id: true } })
  let deleted = 0
  for (const u of users) {
    const snapshots = await prisma.userPositionSnapshot.findMany({
      where: { userId: u.id },
      orderBy: { takenAt: 'desc' },
      select: { id: true },
    })
    if (snapshots.length > keepPerUser) {
      const toDelete = snapshots.slice(keepPerUser).map((s) => s.id)
      const result = await prisma.userPositionSnapshot.deleteMany({
        where: { id: { in: toDelete } },
      })
      deleted += result.count
    }
  }
  return { success: true, deleted }
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
