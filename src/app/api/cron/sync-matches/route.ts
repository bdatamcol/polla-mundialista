import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorldCupMatches, mapFootballMatchToMatch } from '@/lib/football-api'
import { revalidatePath } from 'next/cache'

/**
 * Endpoint para sincronización externa (cron-job.org, EasyCron, etc.)
 * GET /api/cron/sync-matches?secret=TU_SECRETO
 *
 * Diseñado para ejecutarse 2 veces al día:
 * - 17:00 hora Colombia (antes de partidos de la tarde)
 * - 00:00 hora Colombia (antes de partidos de madrugada)
 *
 * Seguridad: requiere un secret en el query string (definir en env como CRON_SECRET)
 */
export async function GET(request: Request) {
  try {
    // Verificar secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const expectedSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar API key
    const apiKey = process.env.FOOTBALL_DATA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FOOTBALL_DATA_API_KEY no configurada' },
        { status: 500 }
      )
    }

    const worldCupMatches = await getWorldCupMatches()
    if (!worldCupMatches || worldCupMatches.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron obtener partidos' },
        { status: 500 }
      )
    }

    const results = { created: 0, updated: 0, total: worldCupMatches.length }

    for (const fm of worldCupMatches) {
      const matchData = mapFootballMatchToMatch(fm)
      const existingMatch = await prisma.match.findUnique({
        where: { externalId: fm.id.toString() },
      })

      if (existingMatch) {
        const isTbd =
          existingMatch.homeTeam === 'TBD' || existingMatch.awayTeam === 'TBD'

        await prisma.match.update({
          where: { id: existingMatch.id },
          data: {
            ...(isTbd && {
              homeTeam: matchData.homeTeam,
              homeTeamFull: matchData.homeTeamFull,
              homeTeamFlag: matchData.homeTeamFlag,
              homeTeamCrest: matchData.homeTeamCrest,
              homeTeamTla: matchData.homeTeamTla,
              homeTeamIso2: matchData.homeTeamIso2,
              awayTeam: matchData.awayTeam,
              awayTeamFull: matchData.awayTeamFull,
              awayTeamFlag: matchData.awayTeamFlag,
              awayTeamCrest: matchData.awayTeamCrest,
              awayTeamTla: matchData.awayTeamTla,
              awayTeamIso2: matchData.awayTeamIso2,
              group: matchData.group,
              phase: matchData.phase,
            }),
            status: matchData.status,
            homeGoals: matchData.homeGoals,
            awayGoals: matchData.awayGoals,
            lastSyncAt: new Date(),
          },
        })
        results.updated++
      } else {
        await prisma.match.create({
          data: {
            externalId: fm.id.toString(),
            homeTeam: matchData.homeTeam,
            homeTeamFull: matchData.homeTeamFull,
            homeTeamFlag: matchData.homeTeamFlag,
            homeTeamCrest: matchData.homeTeamCrest,
            homeTeamTla: matchData.homeTeamTla,
            homeTeamIso2: matchData.homeTeamIso2,
            awayTeam: matchData.awayTeam,
            awayTeamFull: matchData.awayTeamFull,
            awayTeamFlag: matchData.awayTeamFlag,
            awayTeamCrest: matchData.awayTeamCrest,
            awayTeamTla: matchData.awayTeamTla,
            awayTeamIso2: matchData.awayTeamIso2,
            group: matchData.group,
            phase: matchData.phase,
            matchDate: matchData.matchDate,
            status: matchData.status,
            homeGoals: matchData.homeGoals,
            awayGoals: matchData.awayGoals,
            lastSyncAt: new Date(),
          },
        })
        results.created++
      }
    }

    // Refrescar las páginas que muestran partidos
    revalidatePath('/')
    revalidatePath('/dashboard')
    revalidatePath('/predicciones')
    revalidatePath('/ranking')

    return NextResponse.json({
      success: true,
      message: `Sincronización externa completada: ${results.created} creados, ${results.updated} actualizados`,
      ...results,
    })
  } catch (error) {
    console.error('Error en cron sync-matches:', error)
    return NextResponse.json({ error: 'Error de sincronización' }, { status: 500 })
  }
}
