import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWorldCupMatches, getLiveMatches, mapFootballMatchToMatch } from '@/lib/football-api'
import { calculatePredictionPoints, DEFAULT_POINTS_CONFIG } from '@/lib/points'
import { recalculateFinalistPoints } from '@/actions/finalist-actions'

// GET /api/sync/results - Actualiza resultados desde football-data.org
// Este endpoint debería llamarse cada 1-5 minutos durante partidos en vivo
export async function GET() {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'FOOTBALL_DATA_API_KEY no está configurada' },
        { status: 500 }
      )
    }

    // Obtener todos los partidos del Mundial (también verifica cambios en estados)
    const worldCupMatches = await getWorldCupMatches()

    // Obtener configuración de puntos
    let pointsConfig = await prisma.pointsConfig.findFirst()
    if (!pointsConfig) {
      pointsConfig = await prisma.pointsConfig.create({
        data: DEFAULT_POINTS_CONFIG,
      })
    }

    const pointsConfigForCalc = {
      groupStagePoints: pointsConfig.groupStagePoints,
      quartersPoints: pointsConfig.quartersPoints,
      finalPoints: pointsConfig.finalPoints,
    }

    const results = {
      matchesUpdated: 0,
      scoresCalculated: 0,
      matches: [] as { id: string; homeTeam: string; awayTeam: string; status: string; homeGoals: number | null; awayGoals: number | null }[],
    }

    for (const fm of worldCupMatches) {
      const matchData = mapFootballMatchToMatch(fm)

      // Solo procesar partidos que ya tienen resultado (FINISHED) o están en vivo
      if (matchData.status === 'PENDING' && !matchData.homeGoals) {
        continue
      }

      // Buscar partido en BD por externalId
      const existingMatch = await prisma.match.findUnique({
        where: { externalId: fm.id.toString() },
        include: {
          predictions: true,
        },
      })

      if (!existingMatch) {
        continue
      }

      // Verificar si hay cambios
      const hasScoreChanged =
        existingMatch.homeGoals !== matchData.homeGoals ||
        existingMatch.awayGoals !== matchData.awayGoals
      const hasStatusChanged = existingMatch.status !== matchData.status

      if (!hasScoreChanged && !hasStatusChanged) {
        continue
      }

      // Si el partido terminó y no tenía resultado antes, calcular puntos
      if (
        matchData.status === 'FINISHED' &&
        existingMatch.status !== 'FINISHED' &&
        matchData.homeGoals !== undefined &&
        matchData.awayGoals !== undefined
      ) {
        // Resetear puntos anteriores del partido
        for (const prediction of existingMatch.predictions) {
          const oldPoints = prediction.points

          // Descontar puntos antiguos del usuario
          if (oldPoints > 0) {
            await prisma.user.update({
              where: { id: prediction.userId },
              data: {
                totalPoints: { decrement: oldPoints },
                exactScores: { decrement: prediction.isExactScore ? 1 : 0 },
                correctWinners: { decrement: prediction.isCorrectWinner ? 1 : 0 },
              },
            })
          }

          // Calcular nuevos puntos pasando la fase del partido
          const pointsResult = calculatePredictionPoints(
            prediction.homeGoals,
            prediction.awayGoals,
            matchData.homeGoals!,
            matchData.awayGoals!,
            { matchPoints: pointsConfigForCalc.groupStagePoints, 
              semifinalistPoints: pointsConfigForCalc.quartersPoints, 
              finalistPoints: pointsConfigForCalc.finalPoints },
            existingMatch.phase
          )

          // Actualizar predicción
          await prisma.prediction.update({
            where: { id: prediction.id },
            data: {
              points: pointsResult.points,
              isExactScore: pointsResult.isExactScore,
              isCorrectWinner: pointsResult.isCorrectWinner,
            },
          })

          // Agregar puntos nuevos al usuario
          if (pointsResult.points > 0) {
            await prisma.user.update({
              where: { id: prediction.userId },
              data: {
                totalPoints: { increment: pointsResult.points },
                exactScores: { increment: pointsResult.isExactScore ? 1 : 0 },
                correctWinners: { increment: pointsResult.isCorrectWinner ? 1 : 0 },
              },
            })
          }

          results.scoresCalculated++
        }
      }

      // Actualizar partido
      await prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          status: matchData.status,
          homeGoals: matchData.homeGoals,
          awayGoals: matchData.awayGoals,
          lastSyncAt: new Date(),
        },
      })

      results.matchesUpdated++
      results.matches.push({
        id: existingMatch.id,
        homeTeam: existingMatch.homeTeam,
        awayTeam: existingMatch.awayTeam,
        status: matchData.status,
        homeGoals: matchData.homeGoals ?? null,
        awayGoals: matchData.awayGoals ?? null,
      })
    }

    // Si se actualizó algún partido de cuartos o semis, recalcular puntos de finalistas
    const knockoutUpdated = results.matches.some((m) => {
      return m.id && (m.status === 'FINISHED')
    })

    let finalistResult: Awaited<ReturnType<typeof recalculateFinalistPoints>> | null = null
    // Solo recalcular si hubo cambios de estado de cuartos/semis/final
    const phaseChanged = await prisma.match.findFirst({
      where: {
        status: 'FINISHED',
        phase: { in: ['QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'] },
        lastSyncAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // actualizado en los últimos 5 min
      },
    })

    if (phaseChanged) {
      finalistResult = await recalculateFinalistPoints()
    }

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'SYNC_RESULTS',
        details: { results, finalistResult },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Resultados sincronizados: ${results.matchesUpdated} partidos actualizados, ${results.scoresCalculated} predicciones recalculadas`,
      ...results,
    })
  } catch (error) {
    console.error('Error sincronizando resultados:', error)
    return NextResponse.json(
      { error: 'Error sincronizando resultados' },
      { status: 500 }
    )
  }
}
