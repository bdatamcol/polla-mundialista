import { Role, MatchStatus, User, Match, Prediction, Prize, PointsConfig } from '@prisma/client'

export type { Role, MatchStatus, User, Match, Prediction, Prize, PointsConfig }

export interface RankingEntry {
  position: number
  id: string
  name: string
  totalPoints: number
  exactScores: number
  correctWinners: number
  /** Total de aciertos: marcadores exactos + ganadores correctos */
  hits: number
  predictionsCount: number
  createdAt: Date
  /** Tendencia de la posición vs el snapshot previo */
  trend: {
    /** Posición anterior (null si no hay snapshot previo) */
    previousPosition: number | null
    /** Diferencia: positivo = subió en el ranking, negativo = bajó, 0 = igual */
    delta: number | null
    /** "UP" | "DOWN" | "SAME" | "NEW" */
    direction: 'UP' | 'DOWN' | 'SAME' | 'NEW'
  }
}

export interface PredictionWithMatch extends Prediction {
  match: Match
}

export interface UserWithStats extends User {
  predictionsCount: number
  position?: number
}

export interface MatchWithPredictions extends Match {
  predictions: Prediction[]
}

export type MatchStatusType = 'PENDING' | 'LIVE' | 'FINISHED'
export type UserRole = 'USER' | 'ADMIN'
