'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { WC_2026_TEAMS } from '@/lib/wc-2026-teams'

/**
 * Verifica si las predicciones de finalistas están cerradas.
 * Se cierran cuando comienza el primer partido de Octavos de final.
 */
export async function isFinalistPredictionLocked(): Promise<boolean> {
  const firstKnockout = await prisma.match.findFirst({
    where: {
      phase: { in: ['ROUND_OF_16', 'QUARTER_FINAL'] },
    },
    orderBy: { matchDate: 'asc' },
    select: { matchDate: true },
  })

  if (!firstKnockout) {
    return false // Aún no hay partidos de eliminatoria sincronizados
  }

  return new Date() >= firstKnockout.matchDate
}

/**
 * Devuelve la lista de equipos disponibles para elegir como finalistas.
 * Combina los equipos sincronizados en la BD con la lista oficial del Mundial 2026.
 */
export async function getAvailableTeams() {
  // 1. Intentar obtener equipos desde los partidos sincronizados
  const matches = await prisma.match.findMany({
    where: {
      NOT: {
        OR: [
          { homeTeam: 'TBD' },
          { awayTeam: 'TBD' },
        ],
      },
    },
    select: {
      homeTeam: true,
      homeTeamFull: true,
      homeTeamTla: true,
      homeTeamFlag: true,
      homeTeamCrest: true,
      homeTeamIso2: true,
    },
    take: 200,
  })

  const teamsMap = new Map<string, {
    name: string
    full: string
    tla: string
    flag: string | null
    crest: string | null
    iso2: string | null
  }>()

  for (const m of matches) {
    if (m.homeTeamTla && !teamsMap.has(m.homeTeamTla)) {
      teamsMap.set(m.homeTeamTla, {
        name: m.homeTeam,
        full: m.homeTeamFull || m.homeTeam,
        tla: m.homeTeamTla,
        flag: m.homeTeamFlag,
        crest: m.homeTeamCrest,
        iso2: m.homeTeamIso2,
      })
    }
  }

  // 2. Combinar con la lista oficial de WC 2026 (incluyendo equipos débiles
  //    como Haití, Cabo Verde, Curazao, etc. para que los usuarios puedan
  //    predecir incluso "este equipo no pasa de grupos")
  for (const team of WC_2026_TEAMS) {
    if (!teamsMap.has(team.tla)) {
      teamsMap.set(team.tla, {
        name: team.name,
        full: team.name,
        tla: team.tla,
        flag: null,
        crest: null,
        iso2: team.iso2,
      })
    }
  }

  return Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Obtiene la predicción de finalistas del usuario actual.
 */
export async function getMyFinalistPrediction() {
  const user = await getCurrentUser()
  if (!user) return null

  return prisma.finalistPrediction.findUnique({
    where: { userId: user.id },
  })
}

/**
 * Guarda o actualiza la predicción de finalistas.
 * Valida que no haya selecciones duplicadas.
 */
export async function saveFinalistPrediction(data: {
  semifinalists: string[] // 4 TLAs
  finalists: string[]     // 2 TLAs
}) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión' }
  }

  if (!user.isActive) {
    return { success: false, error: 'Tu cuenta está desactivada. No puedes hacer predicciones.' }
  }

  // Verificar que no esté cerrada
  const locked = await isFinalistPredictionLocked()
  if (locked) {
    return {
      success: false,
      error: 'Las predicciones de finalistas ya están cerradas (comenzaron los octavos de final)',
    }
  }

  // Validaciones
  const semis = data.semifinalists.map((t) => t.toUpperCase()).filter(Boolean)
  const finals = data.finalists.map((t) => t.toUpperCase()).filter(Boolean)

  if (semis.length !== 4) {
    return { success: false, error: 'Debes seleccionar exactamente 4 semifinalistas' }
  }
  if (finals.length !== 2) {
    return { success: false, error: 'Debes seleccionar exactamente 2 finalistas' }
  }
  if (new Set(semis).size !== 4) {
    return { success: false, error: 'Los semifinalistas deben ser equipos diferentes' }
  }
  if (new Set(finals).size !== 2) {
    return { success: false, error: 'Los finalistas deben ser equipos diferentes' }
  }

  // Verificar que los finalistas seleccionados también estén en los semifinalistas
  // (un finalista primero debe pasar por semifinal)
  for (const finalist of finals) {
    if (!semis.includes(finalist)) {
      return {
        success: false,
        error: `El finalista ${finalist} debe estar entre tus semifinalistas`,
      }
    }
  }

  // Guardar/actualizar
  const prediction = await prisma.finalistPrediction.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      semifinalist1: semis[0],
      semifinalist2: semis[1],
      semifinalist3: semis[2],
      semifinalist4: semis[3],
      finalist1: finals[0],
      finalist2: finals[1],
    },
    update: {
      semifinalist1: semis[0],
      semifinalist2: semis[1],
      semifinalist3: semis[2],
      semifinalist4: semis[3],
      finalist1: finals[0],
      finalist2: finals[1],
    },
  })

  revalidatePath('/predicciones/finalistas')
  revalidatePath('/dashboard')

  return { success: true, prediction }
}

/**
 * Calcula los puntos de finalistas para todos los usuarios.
 * Se llama cuando terminan los cuartos de final y las semifinales.
 */
export async function recalculateFinalistPoints() {
  // Obtener partidos de cuartos de final
  const quarterFinals = await prisma.match.findMany({
    where: { phase: 'QUARTER_FINAL', status: 'FINISHED' },
  })

  // Obtener partidos de semifinales
  const semiFinals = await prisma.match.findMany({
    where: { phase: 'SEMI_FINAL', status: 'FINISHED' },
  })

  // Determinar semifinalistas reales (ganadores de cuartos)
  let actualSemifinalists: string[] = []
  if (quarterFinals.length === 4) {
    actualSemifinalists = quarterFinals.map((m) =>
      (m.homeGoals! > m.awayGoals! ? m.homeTeamTla : m.awayTeamTla)!
    ).filter(Boolean) as string[]
  }

  // Determinar finalistas reales (ganadores de semis)
  let actualFinalists: string[] = []
  if (semiFinals.length === 2) {
    actualFinalists = semiFinals.map((m) =>
      (m.homeGoals! > m.awayGoals! ? m.homeTeamTla : m.awayTeamTla)!
    ).filter(Boolean) as string[]
  }

  if (actualSemifinalists.length === 0 && actualFinalists.length === 0) {
    return { success: true, updated: 0, message: 'Aún no hay resultados de eliminatorias' }
  }

  // Obtener configuración de puntos
  const config = (await prisma.pointsConfig.findFirst()) || {
    semifinalistPoints: 10,
    finalistPoints: 20,
  }

  // Obtener todas las predicciones
  const predictions = await prisma.finalistPrediction.findMany()

  let updated = 0

  for (const pred of predictions) {
    const userPicks = {
      semifinalists: [
        pred.semifinalist1,
        pred.semifinalist2,
        pred.semifinalist3,
        pred.semifinalist4,
      ].filter(Boolean) as string[],
      finalists: [pred.finalist1, pred.finalist2].filter(Boolean) as string[],
    }

    const userSemis = userPicks.semifinalists.map((t) => t.toUpperCase())
    const userFinals = userPicks.finalists.map((t) => t.toUpperCase())
    const actualSemis = actualSemifinalists.map((t) => t.toUpperCase())
    const actualFinals = actualFinalists.map((t) => t.toUpperCase())

    const semisCorrect = userSemis.filter((t) => actualSemis.includes(t)).length
    const finalsCorrect = userFinals.filter((t) => actualFinals.includes(t)).length

    const semiPoints = semisCorrect * config.semifinalistPoints
    const finalPoints = finalsCorrect * config.finalistPoints
    const total = semiPoints + finalPoints

    // Diferencia con el valor actual
    const oldTotal = pred.totalPoints
    const diff = total - oldTotal

    await prisma.finalistPrediction.update({
      where: { id: pred.id },
      data: {
        semifinalPoints: semiPoints,
        finalPoints,
        totalPoints: total,
        semisCorrect,
        finalsCorrect,
      },
    })

    if (diff !== 0) {
      await prisma.user.update({
        where: { id: pred.userId },
        data: {
          finalistPoints: { increment: diff },
          totalPoints: { increment: diff },
        },
      })
    }

    updated++
  }

  return {
    success: true,
    updated,
    actualSemifinalists,
    actualFinalists,
  }
}
