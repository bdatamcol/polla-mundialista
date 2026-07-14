'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { WC_2026_TEAMS } from '@/lib/wc-2026-teams'

/**
 * Verifica si las predicciones de finalistas están cerradas.
 *
 * Regla: se cierran a las 11:30 AM hora Colombia del día en que
 * se juega el primer partido de Octavos de Final (ROUND_OF_16).
 *
 * - Si la API tiene octavos → lock a las 11:30 AM Colombia del primer partido
 * - Si la API NO tiene octavos → BLOQUEADO (asumimos que el plazo ya pasó)
 *   Esto evita que la gente siga editando si la API aún no sincroniza los octavos.
 */
export async function isFinalistPredictionLocked(): Promise<boolean> {
  const firstRoundOf16 = await prisma.match.findFirst({
    where: { phase: 'ROUND_OF_16' },
    orderBy: { matchDate: 'asc' },
    select: { matchDate: true },
  })

  // Si no hay octavos aún, asumimos que el plazo ya pasó y bloqueamos.
  // Los que ya guardaron, sus predicciones quedan. Los que no, no pueden elegir.
  if (!firstRoundOf16) {
    return true
  }

  // 11:30 AM Colombia (UTC-5) = 16:30 UTC del día del primer partido de octavos
  const matchDate = new Date(firstRoundOf16.matchDate)
  const lockAt = new Date(
    Date.UTC(
      matchDate.getUTCFullYear(),
      matchDate.getUTCMonth(),
      matchDate.getUTCDate(),
      16, 30, 0, 0
    )
  )

  return new Date() >= lockAt
}

/**
 * Devuelve la lista de equipos disponibles para elegir como finalistas.
 *
 * Fuente de verdad: los equipos que aparecen en partidos sincronizados en la BD
 * (vienen de la API del Mundial, que solo incluye equipos clasificados).
 *
 * Adicionalmente incluye los equipos de predicciones ya guardadas para que
 * el usuario pueda ver sus selecciones anteriores aunque el equipo ya no esté
 * en partidos activos.
 */
export async function getAvailableTeams() {
  // 1. Equipos desde partidos sincronizados (los que REALMENTE juegan el mundial)
  const matches = await prisma.match.findMany({
    where: {
      NOT: {
        OR: [
          { homeTeam: 'TBD' },
          { awayTeam: 'TBD' },
        ],
      },
      homeTeamTla: { not: null },
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

  // 2. Equipos ya guardados en predicciones previas (para que el form los muestre
  //    como seleccionados aunque el equipo no esté en partidos actuales)
  const existingPredictions = await prisma.finalistPrediction.findMany({
    select: {
      semifinalist1: true,
      semifinalist2: true,
      semifinalist3: true,
      semifinalist4: true,
      finalist1: true,
      finalist2: true,
    },
  })

  const savedTlas = new Set<string>()
  for (const p of existingPredictions) {
    for (const tla of [
      p.semifinalist1,
      p.semifinalist2,
      p.semifinalist3,
      p.semifinalist4,
      p.finalist1,
      p.finalist2,
    ]) {
      if (tla) savedTlas.add(tla)
    }
  }

  // Para TLAs guardados que no estén en matches, buscar en WC_2026_TEAMS para mostrar nombre
  for (const tla of savedTlas) {
    if (!teamsMap.has(tla)) {
      const team = WC_2026_TEAMS.find((t) => t.tla === tla)
      if (team) {
        teamsMap.set(tla, {
          name: team.name,
          full: team.name,
          tla: team.tla,
          flag: null,
          crest: null,
          iso2: team.iso2,
        })
      } else {
        // Si no lo encontramos, agregar con TLA como nombre
        teamsMap.set(tla, {
          name: tla,
          full: tla,
          tla,
          flag: null,
          crest: null,
          iso2: null,
        })
      }
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
 * Se llama cuando hay cambios en cuartos, semis o final.
 *
 * Lógica de detección:
 * - Semifinalistas: equipos únicos en partidos SEMI_FINAL (PENDING o FINISHED).
 *   Si una semi ya está programada con equipos reales, esos equipos ya son
 *   semifinalistas confirmados (no necesitamos esperar a que termine).
 *   Fallback: si no hay semis, usar ganadores de cuartos terminados.
 * - Finalistas: solo cuando las 2 semis están terminadas → ganador de cada semi.
 */
export async function recalculateFinalistPoints() {
  // Obtener partidos de cuartos de final terminados
  const quarterFinals = await prisma.match.findMany({
    where: { phase: 'QUARTER_FINAL', status: 'FINISHED' },
  })

  // Obtener partidos de semifinales (PENDING o FINISHED)
  const semiFinalMatches = await prisma.match.findMany({
    where: { phase: 'SEMI_FINAL' },
  })

  // Obtener partido de la final
  const finalMatch = await prisma.match.findFirst({
    where: { phase: 'FINAL' },
  })

  // === Determinar semifinalistas reales ===
  let actualSemifinalists: string[] = []

  if (semiFinalMatches.length > 0) {
    // Equipos únicos en los partidos de semis (PENDING o FINISHED).
    // Si una semi ya tiene equipos definidos, esos equipos ya son
    // semifinalistas confirmados, sin importar el resultado de la semi.
    const semisTeams: string[] = []
    for (const m of semiFinalMatches) {
      if (m.homeTeamTla && m.homeTeamTla !== 'TBD') {
        semisTeams.push(m.homeTeamTla)
      }
      if (m.awayTeamTla && m.awayTeamTla !== 'TBD') {
        semisTeams.push(m.awayTeamTla)
      }
    }
    actualSemifinalists = Array.from(new Set(semisTeams))
  } else if (quarterFinals.length === 4) {
    // Fallback: si no hay semis programadas, usar ganadores de cuartos
    actualSemifinalists = quarterFinals.map((m) =>
      (m.homeGoals! > m.awayGoals! ? m.homeTeamTla : m.awayTeamTla)!
    ).filter(Boolean) as string[]
  }

  // === Determinar finalistas reales ===
  // Equipos únicos en la final (PENDING o FINISHED) — si la final ya tiene
  // equipos asignados, ya son finalistas confirmados.
  let actualFinalists: string[] = []
  if (finalMatch) {
    if (finalMatch.homeTeamTla && finalMatch.homeTeamTla !== 'TBD') {
      actualFinalists.push(finalMatch.homeTeamTla)
    }
    if (finalMatch.awayTeamTla && finalMatch.awayTeamTla !== 'TBD') {
      actualFinalists.push(finalMatch.awayTeamTla)
    }
    actualFinalists = Array.from(new Set(actualFinalists))
  }

  // Fallback final para finalistas: si no hay final programada, usar ganadores de semis terminadas
  if (actualFinalists.length === 0) {
    const finishedSemis = semiFinalMatches.filter((m) => m.status === 'FINISHED')
    if (finishedSemis.length === 2) {
      actualFinalists = finishedSemis.map((m) =>
        (m.homeGoals! > m.awayGoals! ? m.homeTeamTla : m.awayTeamTla)!
      ).filter(Boolean) as string[]
    }
  }

  if (actualSemifinalists.length === 0 && actualFinalists.length === 0) {
    return {
      success: true,
      updated: 0,
      message: 'Aún no hay resultados de eliminatorias',
    }
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
