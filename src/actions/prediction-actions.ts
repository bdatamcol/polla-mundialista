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

/**
 * Estadísticas comunitarias del próximo partido:
 * - Moda (marcador más predicho)
 * - Distribución por resultado (local / empate / visitante)
 * - Predicción del usuario actual (si existe)
 */
export async function getNextMatchStats(matchId: string) {
  const currentUser = await getCurrentUser()

  const [predictions, userPrediction] = await Promise.all([
    prisma.prediction.findMany({
      where: { matchId },
      select: { homeGoals: true, awayGoals: true },
    }),
    currentUser
      ? prisma.prediction.findUnique({
          where: {
            userId_matchId: { userId: currentUser.id, matchId },
          },
          select: { homeGoals: true, awayGoals: true, createdAt: true },
        })
      : Promise.resolve(null),
  ])

  const total = predictions.length

  // Distribución: local gana / empate / visitante gana
  let homeWinCount = 0
  let drawCount = 0
  let awayWinCount = 0
  const scoreCounts = new Map<string, number>()

  for (const p of predictions) {
    const key = `${p.homeGoals}-${p.awayGoals}`
    scoreCounts.set(key, (scoreCounts.get(key) ?? 0) + 1)

    if (p.homeGoals > p.awayGoals) homeWinCount++
    else if (p.homeGoals < p.awayGoals) awayWinCount++
    else drawCount++
  }

  // Moda: marcador con más predicciones
  let modeScore: { homeGoals: number; awayGoals: number; count: number } | null = null
  for (const [key, count] of scoreCounts.entries()) {
    if (!modeScore || count > modeScore.count) {
      const [h, a] = key.split('-').map(Number)
      modeScore = { homeGoals: h, awayGoals: a, count }
    }
  }

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)

  return {
    total,
    mode: modeScore
      ? {
          homeGoals: modeScore.homeGoals,
          awayGoals: modeScore.awayGoals,
          count: modeScore.count,
          percentage: pct(modeScore.count),
        }
      : null,
    distribution: {
      homeWin: { count: homeWinCount, percentage: pct(homeWinCount) },
      draw: { count: drawCount, percentage: pct(drawCount) },
      awayWin: { count: awayWinCount, percentage: pct(awayWinCount) },
    },
    userPrediction,
  }
}

/**
 * Muro social: últimas predicciones realizadas por la comunidad.
 * Devuelve información resumida (anonimizada opcional, nombre, marcador, partido, tiempo relativo).
 */
export async function getRecentPredictions(limit: number = 10) {
  const predictions = await prisma.prediction.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      homeGoals: true,
      awayGoals: true,
      createdAt: true,
      user: { select: { name: true } },
      match: {
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          matchDate: true,
          status: true,
        },
      },
    },
  })

  return predictions
}
