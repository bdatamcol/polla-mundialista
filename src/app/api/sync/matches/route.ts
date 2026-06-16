import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorldCupMatches, mapFootballMatchToMatch, type FootballMatch } from '@/lib/football-api'

// GET /api/sync/matches - Sincroniza partidos del Mundial desde football-data.org
export async function GET() {
  try {
    // Verificar que existe la API key
    const apiKey = process.env.FOOTBALL_DATA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FOOTBALL_DATA_API_KEY no está configurada' },
        { status: 500 }
      )
    }

    // Obtener partidos de la API
    const worldCupMatches = await getWorldCupMatches()

    if (!worldCupMatches || worldCupMatches.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron obtener partidos del Mundial' },
        { status: 500 }
      )
    }

    const results = {
      created: 0,
      updated: 0,
      total: worldCupMatches.length,
    }

    // Procesar cada partido
    for (const fm of worldCupMatches) {
      const matchData = mapFootballMatchToMatch(fm)

      // Buscar si ya existe por externalId
      const existingMatch = await prisma.match.findUnique({
        where: { externalId: fm.id.toString() },
      })

      if (existingMatch) {
        // Si el partido existente es TBD, actualizarlo con los datos reales de la API
        const isTbd = existingMatch.homeTeam === 'TBD' || existingMatch.awayTeam === 'TBD'

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
        // Crear nuevo partido
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

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'SYNC_MATCHES',
        details: { results },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${results.created} creados, ${results.updated} actualizados`,
      ...results,
    })
  } catch (error) {
    console.error('Error sincronizando partidos:', error)
    return NextResponse.json(
      { error: 'Error sincronizando partidos' },
      { status: 500 }
    )
  }
}
