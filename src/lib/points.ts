// Tipos de fase del torneo
export type Phase = 'GROUP' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL'

export interface PointsResult {
  points: number
  isExactScore: boolean
  isCorrectWinner: boolean
}

export interface PointsConfig {
  groupStagePoints: number
  quartersPoints: number
  finalPoints: number
}

export function getWinner(homeGoals: number, awayGoals: number): 'home' | 'away' | 'draw' {
  if (homeGoals > awayGoals) return 'home'
  if (awayGoals > homeGoals) return 'away'
  return 'draw'
}

// Configuración por defecto (3 niveles)
// Fase 1 (Grupos + Octavos): 5 pts
// Fase 2 (Cuartos + Semis): 10 pts
// Fase 3 (Final): 15 pts
export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  groupStagePoints: 5,
  quartersPoints: 10,
  finalPoints: 15,
}

// Devuelve los puntos correspondientes a la fase del partido
export function getPointsForPhase(phase: Phase | string | null | undefined, config: PointsConfig): number {
  switch (phase) {
    case 'GROUP':
    case 'ROUND_OF_16':
      return config.groupStagePoints
    case 'QUARTER_FINAL':
    case 'SEMI_FINAL':
    case 'THIRD_PLACE':
      return config.quartersPoints
    case 'FINAL':
      return config.finalPoints
    default:
      return config.groupStagePoints
  }
}

// Calcula los puntos de una predicción.
// Regla: solo se otorgan puntos si el marcador es EXACTO.
// Si falla el marcador, obtiene 0 puntos (no hay crédito parcial).
export function calculatePredictionPoints(
  homeGoals: number,
  awayGoals: number,
  realHomeGoals: number,
  realAwayGoals: number,
  config: PointsConfig,
  phase?: Phase | string | null
): PointsResult {
  const isExactScore = homeGoals === realHomeGoals && awayGoals === realAwayGoals
  const predictedWinner = getWinner(homeGoals, awayGoals)
  const realWinner = getWinner(realHomeGoals, realAwayGoals)
  const isCorrectWinner = predictedWinner === realWinner

  // Solo se otorgan puntos por marcador exacto
  let points = 0
  if (isExactScore) {
    points = getPointsForPhase(phase, config)
  }

  return { points, isExactScore, isCorrectWinner }
}
