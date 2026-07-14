import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recalculateFinalistPoints } from '@/actions/finalist-actions'

/**
 * GET /api/admin/finalist-tools
 *
 * Query params:
 * - action=fix-phases | set-prediction | recalculate | all
 * - email=...                    (para set-prediction y all)
 * - semifinalists=FRA,ESP,ENG,ARG (TLAs separados por coma)
 * - finalists=FRA,COL            (TLAs separados por coma)
 *
 * Ejemplos:
 *   /api/admin/finalist-tools?action=fix-phases
 *   /api/admin/finalist-tools?action=recalculate
 *   /api/admin/finalist-tools?action=set-prediction&email=admintowncenter@gmail.com&semifinalists=COL,FRA,ENG,ARG&finalists=FRA,COL
 *   /api/admin/finalist-tools?action=all&email=admintowncenter@gmail.com&semifinalists=COL,FRA,ENG,ARG&finalists=FRA,COL
 *
 * NOTA: Solo para admins. Requiere sesión activa (cookie de auth).
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || ''
    const email = url.searchParams.get('email') || ''
    const semisParam = url.searchParams.get('semifinalists') || ''
    const finalsParam = url.searchParams.get('finalists') || ''

    const data =
      email || semisParam || finalsParam
        ? {
            email,
            semifinalists: semisParam ? semisParam.split(',').map((t) => t.trim()) : undefined,
            finalists: finalsParam ? finalsParam.split(',').map((t) => t.trim()) : undefined,
          }
        : undefined

    if (action === 'fix-phases') {
      return NextResponse.json({ success: true, action, ...(await fixPhases()) })
    }

    if (action === 'set-prediction') {
      return NextResponse.json({ success: true, action, ...(await setPrediction(data)) })
    }

    if (action === 'recalculate') {
      const recalcResults = await recalculateFinalistPoints()
      return NextResponse.json({ action, ...recalcResults })
    }

    if (action === 'all') {
      const fixRes = await fixPhases()
      const setRes = await setPrediction(data)
      const recalcRes = await recalculateFinalistPoints()
      return NextResponse.json({
        success: true,
        action,
        fixPhases: fixRes,
        setPrediction: setRes,
        recalculate: recalcRes,
      })
    }

    if (action === 'debug') {
      return NextResponse.json({ success: true, action, ...(await debugMatches()) })
    }

    if (action === 'force-fix') {
      return NextResponse.json({ success: true, action, ...(await forceFixPhases()) })
    }

    return NextResponse.json(
      { error: `Acción '${action}' no reconocida. Usa: fix-phases, set-prediction, recalculate, all, debug, force-fix` },
      { status: 400 }
    )
  } catch (error) {
    console.error('finalist-tools error:', error)
    return NextResponse.json(
      { error: 'Error en finalist-tools', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Corrige la fase de los partidos del Mundial 2026 que están mal catalogados
 * como GROUP cuando en realidad son cuartos, semis, tercer lugar o final.
 *
 * Calendario Mundial 2026:
 * - 11-15 julio: Cuartos de final
 * - 18-19 julio: Semifinales (y 18 = tercer lugar)
 * - 19 julio: Final
 */
async function fixPhases() {
  const updates: any[] = []

  // Cuartos de final (11-15 julio)
  const quarterUpdate = await prisma.match.updateMany({
    where: {
      matchDate: {
        gte: new Date('2026-07-11T00:00:00Z'),
        lte: new Date('2026-07-15T23:59:59Z'),
      },
      phase: 'GROUP',
    },
    data: { phase: 'QUARTER_FINAL', group: 'Cuartos de final' },
  })
  if (quarterUpdate.count > 0) {
    updates.push({ phase: 'QUARTER_FINAL', count: quarterUpdate.count })
  }

  // Semifinales (16-17 julio)
  const semiUpdate = await prisma.match.updateMany({
    where: {
      matchDate: {
        gte: new Date('2026-07-16T00:00:00Z'),
        lte: new Date('2026-07-17T23:59:59Z'),
      },
      phase: 'GROUP',
    },
    data: { phase: 'SEMI_FINAL', group: 'Semifinal' },
  })
  if (semiUpdate.count > 0) {
    updates.push({ phase: 'SEMI_FINAL', count: semiUpdate.count })
  }

  // Tercer lugar (18 julio)
  const thirdUpdate = await prisma.match.updateMany({
    where: {
      matchDate: {
        gte: new Date('2026-07-18T00:00:00Z'),
        lte: new Date('2026-07-18T23:59:59Z'),
      },
      phase: 'GROUP',
    },
    data: { phase: 'THIRD_PLACE', group: 'Tercer lugar' },
  })
  if (thirdUpdate.count > 0) {
    updates.push({ phase: 'THIRD_PLACE', count: thirdUpdate.count })
  }

  // Final (19+ julio)
  const finalUpdate = await prisma.match.updateMany({
    where: {
      matchDate: {
        gte: new Date('2026-07-19T00:00:00Z'),
      },
      phase: 'GROUP',
    },
    data: { phase: 'FINAL', group: 'Final' },
  })
  if (finalUpdate.count > 0) {
    updates.push({ phase: 'FINAL', count: finalUpdate.count })
  }

  return {
    message: `Fases corregidas: ${updates.length} actualizaciones`,
    updates,
  }
}

/**
 * Inserta/actualiza la predicción de finalistas para un usuario.
 * Omite el lock para que el admin pueda crear predicciones de prueba.
 *
 * data: { email, semifinalists: string[4], finalists: string[2] }
 */
async function setPrediction(data: any) {
  if (!data || !data.email || !data.semifinalists || !data.finalists) {
    return {
      error: 'Faltan datos: { email, semifinalists: [4 TLAs], finalists: [2 TLAs] }',
    }
  }

  const { email, semifinalists, finalists } = data

  if (semifinalists.length !== 4) {
    return { error: 'semifinalists debe tener exactamente 4 TLAs' }
  }
  if (finalists.length !== 2) {
    return { error: 'finalists debe tener exactamente 2 TLAs' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: `No se encontró usuario con email: ${email}` }
  }

  // Normalizar a uppercase
  const semis = semifinalists.map((t: string) => t.toUpperCase())
  const finals = finalists.map((t: string) => t.toUpperCase())

  // Validar que los finalistas estén en los semifinalistas
  for (const finalist of finals) {
    if (!semis.includes(finalist)) {
      return {
        error: `El finalista ${finalist} debe estar entre los semifinalistas`,
      }
    }
  }

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

  return {
    message: `Predicción guardada para ${email}`,
    userId: user.id,
    prediction: {
      semifinalists: semis,
      finalists: finals,
    },
  }
}

/**
 * Lista los partidos del 10 de julio en adelante para diagnóstico.
 * Muestra el phase actual y la fecha de cada uno.
 */
async function debugMatches() {
  const matches = await prisma.match.findMany({
    where: {
      matchDate: { gte: new Date('2026-07-10T00:00:00Z') },
    },
    select: {
      id: true,
      homeTeam: true,
      awayTeam: true,
      phase: true,
      status: true,
      homeTeamTla: true,
      awayTeamTla: true,
      matchDate: true,
    },
    orderBy: { matchDate: 'asc' },
  })

  const summary = {
    total: matches.length,
    byPhase: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  }
  for (const m of matches) {
    summary.byPhase[m.phase] = (summary.byPhase[m.phase] || 0) + 1
    summary.byStatus[m.status] = (summary.byStatus[m.status] || 0) + 1
  }

  return {
    message: `${matches.length} partidos desde 10-jul-2026`,
    summary,
    matches,
  }
}

/**
 * Fix agresivo: corrige la fase de los partidos del Mundial 2026.
 *
 * 1. Partidos con phase=GROUP en julio:
 *    - 4-10 jul → ROUND_OF_16 (octavos)
 *    - 11-13 jul → QUARTER_FINAL (cuartos)
 *    - 14-15 jul → SEMI_FINAL (semis)
 *    - 18 jul → THIRD_PLACE
 *    - 19+ jul → FINAL
 *
 * 2. Partidos con phase=QUARTER_FINAL en fechas 14-17 jul → SEMI_FINAL
 *    (porque la API a veces los cataloga como cuartos cuando ya son semis)
 */
async function forceFixPhases() {
  const allMatches = await prisma.match.findMany({
    where: {
      matchDate: { gte: new Date('2026-07-10T00:00:00Z') },
    },
    orderBy: { matchDate: 'asc' },
  })

  if (allMatches.length === 0) {
    return {
      message: 'No hay partidos desde 10-jul-2026.',
      found: 0,
      updates: [],
    }
  }

  const updates: any[] = []

  for (const m of allMatches) {
    const date = new Date(m.matchDate)
    const month = date.getUTCMonth()
    const day = date.getUTCDate()

    if (month !== 6) continue // Solo julio

    let newPhase: string | null = null
    let newGroup: string | null = null

    // Caso 1: partidos mal catalogados como GROUP
    if (m.phase === 'GROUP') {
      if (day >= 4 && day <= 10) {
        newPhase = 'ROUND_OF_16'
        newGroup = 'Octavos de final'
      } else if (day >= 11 && day <= 13) {
        newPhase = 'QUARTER_FINAL'
        newGroup = 'Cuartos de final'
      } else if (day === 14 || day === 15) {
        newPhase = 'SEMI_FINAL'
        newGroup = 'Semifinal'
      } else if (day === 18) {
        newPhase = 'THIRD_PLACE'
        newGroup = 'Tercer lugar'
      } else if (day === 19 || day >= 20) {
        newPhase = 'FINAL'
        newGroup = 'Final'
      }
    }

    // Caso 2: partidos mal catalogados como QUARTER_FINAL cuando ya son semis
    if (m.phase === 'QUARTER_FINAL' && (day === 14 || day === 15)) {
      newPhase = 'SEMI_FINAL'
      newGroup = 'Semifinal'
    }

    // Caso 3: partidos mal catalogados como QUARTER_FINAL cuando son semis (16-17 jul)
    if (m.phase === 'QUARTER_FINAL' && (day === 16 || day === 17)) {
      newPhase = 'SEMI_FINAL'
      newGroup = 'Semifinal'
    }

    if (newPhase) {
      await prisma.match.update({
        where: { id: m.id },
        data: { phase: newPhase as any, group: newGroup as string },
      })
      updates.push({
        id: m.id,
        match: `${m.homeTeam} vs ${m.awayTeam}`,
        matchDate: m.matchDate,
        oldPhase: m.phase,
        newPhase,
      })
    }
  }

  return {
    message: `Fix aplicado. ${updates.length} partidos actualizados.`,
    found: allMatches.length,
    updates,
  }
}
