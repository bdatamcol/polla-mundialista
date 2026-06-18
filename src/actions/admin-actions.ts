'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { calculatePredictionPoints, DEFAULT_POINTS_CONFIG } from '@/lib/points'
import { resultSchema, matchSchema, prizeSchema, pointsConfigSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function loadResults(
  matchId: string,
  data: { homeGoals: number; awayGoals: number }
) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  const validation = resultSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { predictions: true },
  })

  if (!match) {
    return { success: false, error: 'Partido no encontrado' }
  }

  let config = await prisma.pointsConfig.findFirst()
  if (!config) {
    config = await prisma.pointsConfig.create({
      data: DEFAULT_POINTS_CONFIG,
    })
  }

  const pointsConfig = {
    matchPoints: config.matchPoints,
    semifinalistPoints: config.semifinalistPoints,
    finalistPoints: config.finalistPoints,
  }

  // Calculate points for all predictions
  for (const prediction of match.predictions) {
    const result = calculatePredictionPoints(
      prediction.homeGoals,
      prediction.awayGoals,
      data.homeGoals,
      data.awayGoals,
      pointsConfig,
      match.phase
    )

    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        points: result.points,
        isExactScore: result.isExactScore,
        isCorrectWinner: result.isCorrectWinner,
      },
    })

    // Update user totals
    const user = await prisma.user.findUnique({
      where: { id: prediction.userId },
    })

    if (user) {
      await prisma.user.update({
        where: { id: prediction.userId },
        data: {
          totalPoints: { increment: result.points },
          exactScores: { increment: result.isExactScore ? 1 : 0 },
          correctWinners: { increment: result.isCorrectWinner ? 1 : 0 },
        },
      })
    }
  }

  // Update match with results
  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeGoals: data.homeGoals,
      awayGoals: data.awayGoals,
      status: 'FINISHED',
    },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: 'LOAD_RESULTS',
      details: {
        matchId,
        homeGoals: data.homeGoals,
        awayGoals: data.awayGoals,
      },
    },
  })

  revalidatePath('/admin/resultados')
  revalidatePath('/predicciones')
  revalidatePath('/ranking')
  revalidatePath('/admin/predicciones')

  return { success: true }
}

export async function createMatchAdmin(data: {
  homeTeam: string
  awayTeam: string
  group: string
  matchDate: string
}) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  const validation = matchSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const match = await prisma.match.create({
    data: {
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      group: data.group,
      matchDate: new Date(data.matchDate),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE_MATCH',
      details: { matchId: match.id },
    },
  })

  revalidatePath('/admin/partidos')
  revalidatePath('/admin/resultados')

  return { success: true, match }
}

export async function updateMatchAdmin(
  id: string,
  data: {
    homeTeam?: string
    awayTeam?: string
    group?: string
    matchDate?: string
    status?: 'PENDING' | 'LIVE' | 'FINISHED'
  }
) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

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

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE_MATCH',
      details: { matchId: id, data },
    },
  })

  revalidatePath('/admin/partidos')
  revalidatePath('/admin/resultados')

  return { success: true, match }
}

export async function deleteMatchAdmin(id: string) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  await prisma.match.delete({
    where: { id },
  })

  await prisma.auditLog.create({
    data: {
      action: 'DELETE_MATCH',
      details: { matchId: id },
    },
  })

  revalidatePath('/admin/partidos')
  revalidatePath('/admin/resultados')
}

export async function getAllUsers() {
  const admin = await isAdmin()
  if (!admin) {
    return []
  }

  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      cedula: true,
      parentesco: true,
      role: true,
      isActive: true,
      blockedAt: true,
      blockReason: true,
      totalPoints: true,
      exactScores: true,
      correctWinners: true,
      finalistPoints: true,
      createdAt: true,
      _count: {
        select: { predictions: true },
      },
    },
  })
}

export async function toggleUserActive(
  userId: string,
  isActive: boolean,
  blockReason?: string
) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  // Prevenir que el admin se bloquee a sí mismo
  const currentUser = await getCurrentUser()
  if (currentUser?.id === userId && !isActive) {
    return { success: false, error: 'No puedes desactivar tu propia cuenta' }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive,
      blockedAt: isActive ? null : new Date(),
      blockReason: isActive ? null : (blockReason?.trim() || null),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: isActive ? 'ACTIVATE_USER' : 'BLOCK_USER',
      userId: currentUser?.id,
      details: { targetUserId: userId, blockReason: blockReason || null },
    },
  })

  revalidatePath('/admin/usuarios')
  return { success: true, user: updated }
}

export async function createPrize(data: {
  position: number
  title: string
  description: string
  imageUrl?: string | null
  conditions: string
  isPublished?: boolean
}) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  const validation = prizeSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const prize = await prisma.prize.create({
    data: {
      position: data.position,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      conditions: data.conditions,
      isPublished: data.isPublished ?? true,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'CREATE_PRIZE',
      details: { prizeId: prize.id },
    },
  })

  revalidatePath('/admin/premios')
  revalidatePath('/premios')

  return { success: true, prize }
}

export async function updatePrize(
  id: string,
  data: {
    position?: number
    title?: string
    description?: string
    imageUrl?: string | null
    conditions?: string
    isPublished?: boolean
  }
) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  const prize = await prisma.prize.update({
    where: { id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE_PRIZE',
      details: { prizeId: id, data },
    },
  })

  revalidatePath('/admin/premios')
  revalidatePath('/premios')

  return { success: true, prize }
}

export async function deletePrize(id: string) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  await prisma.prize.delete({
    where: { id },
  })

  await prisma.auditLog.create({
    data: {
      action: 'DELETE_PRIZE',
      details: { prizeId: id },
    },
  })

  revalidatePath('/admin/premios')
  revalidatePath('/premios')
}

export async function getPrizes() {
  return prisma.prize.findMany({
    where: { isPublished: true },
    orderBy: { position: 'asc' },
  })
}

export async function getPrizeById(id: string) {
  const admin = await isAdmin()
  if (!admin) {
    return null
  }
  return prisma.prize.findUnique({
    where: { id },
  })
}

export async function getAllPrizesAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    return []
  }
  return prisma.prize.findMany({
    orderBy: { position: 'asc' },
  })
}

export async function getPointsConfig() {
  let config = await prisma.pointsConfig.findFirst()
  if (!config) {
    config = await prisma.pointsConfig.create({
      data: DEFAULT_POINTS_CONFIG,
    })
  }
  return config
}

export async function updatePointsConfig(data: {
  matchPoints: number
  semifinalistPoints: number
  finalistPoints: number
}) {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  const validation = pointsConfigSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const config = await prisma.pointsConfig.update({
    where: { id: (await getPointsConfig()).id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE_POINTS_CONFIG',
      details: data,
    },
  })

  revalidatePath('/admin/configuracion')

  return { success: true, config }
}

export async function recalculateAllPoints() {
  const admin = await isAdmin()
  if (!admin) {
    return { success: false, error: 'No tienes permisos de administrador' }
  }

  // Reset all user points
  await prisma.user.updateMany({
    data: {
      totalPoints: 0,
      exactScores: 0,
      correctWinners: 0,
    },
  })

  // Reset all prediction points
  await prisma.prediction.updateMany({
    data: {
      points: 0,
      isExactScore: false,
      isCorrectWinner: false,
    },
  })

  // Get finished matches with predictions
  const finishedMatches = await prisma.match.findMany({
    where: { status: 'FINISHED' },
    include: { predictions: true },
  })

  const config = await getPointsConfig()
  const pointsConfig = {
    matchPoints: config.matchPoints,
    semifinalistPoints: config.semifinalistPoints,
    finalistPoints: config.finalistPoints,
  }

  for (const match of finishedMatches) {
    if (match.homeGoals === null || match.awayGoals === null) continue

    for (const prediction of match.predictions) {
      const result = calculatePredictionPoints(
        prediction.homeGoals,
        prediction.awayGoals,
        match.homeGoals,
        match.awayGoals,
        pointsConfig,
        match.phase
      )

      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          points: result.points,
          isExactScore: result.isExactScore,
          isCorrectWinner: result.isCorrectWinner,
        },
      })

      await prisma.user.update({
        where: { id: prediction.userId },
        data: {
          totalPoints: { increment: result.points },
          exactScores: { increment: result.isExactScore ? 1 : 0 },
          correctWinners: { increment: result.isCorrectWinner ? 1 : 0 },
        },
      })
    }
  }

  await prisma.auditLog.create({
    data: {
      action: 'RECALCULATE_ALL_POINTS',
    },
  })

  revalidatePath('/ranking')
  revalidatePath('/predicciones')
  revalidatePath('/admin/predicciones')

  return { success: true }
}

export async function getAdminStats() {
  const admin = await isAdmin()
  if (!admin) {
    return null
  }

  const [totalUsers, totalMatches, totalPredictions, finishedMatches, pendingMatches] =
    await Promise.all([
      prisma.user.count(),
      prisma.match.count(),
      prisma.prediction.count(),
      prisma.match.count({ where: { status: 'FINISHED' } }),
      prisma.match.count({ where: { status: 'PENDING' } }),
    ])

  return {
    totalUsers,
    totalMatches,
    totalPredictions,
    finishedMatches,
    pendingMatches,
  }
}
