// Tipos de fase del torneo
export type Phase = 'GROUP' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL'

export interface PointsResult {
  points: number
  isExactScore: boolean
  isCorrectWinner: boolean
}

export interface PointsConfig {
  matchPoints: number
  semifinalistPoints: number
  finalistPoints: number
}

// Configuración por defecto:
// - 5 puntos por acertar marcador exacto en un partido
// - 10 puntos por selección correcta a semifinal (4 selecciones, max 40 pts)
// - 20 puntos por selección correcta a final (2 selecciones, max 40 pts)
export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  matchPoints: 5,
  semifinalistPoints: 10,
  finalistPoints: 20,
}

export function getWinner(homeGoals: number, awayGoals: number): 'home' | 'away' | 'draw' {
  if (homeGoals > awayGoals) return 'home'
  if (awayGoals > homeGoals) return 'away'
  return 'draw'
}

// Calcula los puntos de una predicción de partido.
// Regla: solo se otorgan puntos si el marcador es EXACTO.
// Si falla el marcador, obtiene 0 puntos (no hay crédito parcial).
// El puntaje es uniforme para todas las fases (5 pts por defecto).
export function calculatePredictionPoints(
  homeGoals: number,
  awayGoals: number,
  realHomeGoals: number,
  realAwayGoals: number,
  config: PointsConfig,
  _phase?: Phase | string | null
): PointsResult {
  const isExactScore = homeGoals === realHomeGoals && awayGoals === realAwayGoals
  const predictedWinner = getWinner(homeGoals, awayGoals)
  const realWinner = getWinner(realHomeGoals, realAwayGoals)
  const isCorrectWinner = predictedWinner === realWinner

  const points = isExactScore ? config.matchPoints : 0

  return { points, isExactScore, isCorrectWinner }
}

export interface FinalistPointsResult {
  semifinalPoints: number
  finalPoints: number
  totalPoints: number
  semisCorrect: number
  finalsCorrect: number
}

// Calcula los puntos de una predicción de finalistas.
// userPicks: { semifinalists: [tla1, tla2, tla3, tla4], finalists: [tla1, tla2] }
// actualSemifinalists / actualFinalists: arrays con los TLA reales que clasificaron
export function calculateFinalistPoints(
  userPicks: { semifinalists: string[]; finalists: string[] },
  actualSemifinalists: string[],
  actualFinalists: string[],
  config: PointsConfig
): FinalistPointsResult {
  // Filtra vacíos y normaliza a uppercase
  const userSemis = userPicks.semifinalists.filter(Boolean).map((t) => t.toUpperCase())
  const userFinals = userPicks.finalists.filter(Boolean).map((t) => t.toUpperCase())
  const actualSemis = actualSemifinalists.filter(Boolean).map((t) => t.toUpperCase())
  const actualFinals = actualFinalists.filter(Boolean).map((t) => t.toUpperCase())

  const semisCorrect = userSemis.filter((t) => actualSemis.includes(t)).length
  const finalsCorrect = userFinals.filter((t) => actualFinals.includes(t)).length

  return {
    semifinalPoints: semisCorrect * config.semifinalistPoints,
    finalPoints: finalsCorrect * config.finalistPoints,
    totalPoints: semisCorrect * config.semifinalistPoints + finalsCorrect * config.finalistPoints,
    semisCorrect,
    finalsCorrect,
  }
}
