import { Role, MatchStatus, User, Match, Prediction, Prize, PointsConfig } from '@prisma/client'

export type { Role, MatchStatus, User, Match, Prediction, Prize, PointsConfig }

export interface RankingEntry {
  position: number
  id: string
  name: string
  totalPoints: number
  exactScores: number
  correctWinners: number
  predictionsCount: number
  createdAt: Date
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
