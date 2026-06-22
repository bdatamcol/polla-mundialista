'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { calculatePredictionPoints, DEFAULT_POINTS_CONFIG } from '@/lib/points'
import { isMatchLocked } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import type { PredictionWithMatch } from '@/types'

export async function getUserPredictions(userId?: string): Promise<PredictionWithMatch[]> {
  const currentUser = await getCurrentUser()
  const targetUserId = userId || currentUser?.id

  if (!targetUserId) return []

  return prisma.prediction.findMany({
    where: { userId: targetUserId },
    include: {
      match: true,
    },
    orderBy: {
      match: {
        matchDate: 'desc',
      },
    },
  })
}

/**
 * Versión paginada de getUserPredictions.
 * Retorna predicciones del usuario actual con metadata de paginación.
 */
export async function getMyPredictionsPaginated(options: {
  page?: number
  pageSize?: number
  status?: 'PENDING' | 'LIVE' | 'FINISHED' | 'ALL'
}) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { predictions: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
  }

  const page = Math.max(1, options.page || 1)
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 20))
  const skip = (page - 1) * pageSize

  // Construir filtro de match status si se especifica
  const matchFilter =
    options.status && options.status !== 'ALL'
      ? { match: { status: options.status } }
      : {}

  const where = {
    userId: currentUser.id,
    ...matchFilter,
  }

  const [predictions, total] = await Promise.all([
    prisma.prediction.findMany({
      where,
      include: { match: true },
      orderBy: { match: { matchDate: 'desc' } },
      skip,
      take: pageSize,
    }),
    prisma.prediction.count({ where }),
  ])

  return {
    predictions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getPrediction(userId: string, matchId: string) {
  return prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId,
        matchId,
      },
    },
    include: {
      match: true,
    },
  })
}

export async function createPrediction(data: {
  matchId: string
  homeGoals: number
  awayGoals: number
}) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' }
  }

  if (!user.isActive) {
    return { success: false, error: 'Tu cuenta está desactivada. No puedes hacer predicciones.' }
  }

  const match = await prisma.match.findUnique({
    where: { id: data.matchId },
  })

  if (!match) {
    return { success: false, error: 'Partido no encontrado' }
  }

  if (isMatchLocked(match.matchDate, match.status)) {
    return { success: false, error: 'No puedes predecir este partido, ya comenzó' }
  }

  const existingPrediction = await prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId: user.id,
        matchId: data.matchId,
      },
    },
  })

  if (existingPrediction) {
    return { success: false, error: 'Ya tienes una predicción para este partido' }
  }

  const prediction = await prisma.prediction.create({
    data: {
      userId: user.id,
      matchId: data.matchId,
      homeGoals: data.homeGoals,
      awayGoals: data.awayGoals,
    },
    include: {
      match: true,
    },
  })

  revalidatePath('/predicciones')
  revalidatePath('/dashboard')
  revalidatePath('/ranking')

  return { success: true, prediction }
}

export async function updatePrediction(
  id: string,
  data: { homeGoals: number; awayGoals: number }
) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' }
  }

  if (!user.isActive) {
    return { success: false, error: 'Tu cuenta está desactivada. No puedes editar predicciones.' }
  }

  const prediction = await prisma.prediction.findUnique({
    where: { id },
    include: { match: true },
  })

  if (!prediction) {
    return { success: false, error: 'Predicción no encontrada' }
  }

  if (prediction.userId !== user.id) {
    return { success: false, error: 'No puedes editar esta predicción' }
  }

  if (isMatchLocked(prediction.match.matchDate, prediction.match.status)) {
    return { success: false, error: 'No puedes editar, el partido ya comenzó' }
  }

  const updated = await prisma.prediction.update({
    where: { id },
    data: {
      homeGoals: data.homeGoals,
      awayGoals: data.awayGoals,
    },
    include: {
      match: true,
    },
  })

  revalidatePath('/predicciones')
  revalidatePath('/dashboard')
  revalidatePath('/ranking')

  return { success: true, prediction: updated }
}

export async function getPredictionStats(userId?: string) {
  const currentUser = await getCurrentUser()
  const targetUserId = userId || currentUser?.id

  if (!targetUserId) {
    return {
      total: 0,
      pending: 0,
      scored: 0,
      exactScores: 0,
      correctWinners: 0,
    }
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId: targetUserId },
    include: { match: true },
  })

  return {
    total: predictions.length,
    pending: predictions.filter((p) => p.match.status === 'PENDING').length,
    scored: predictions.filter((p) => p.points > 0).length,
    exactScores: predictions.filter((p) => p.isExactScore).length,
    correctWinners: predictions.filter((p) => p.isCorrectWinner).length,
  }
}
