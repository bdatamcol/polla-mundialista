import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
  }),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const predictionSchema = z.object({
  matchId: z.string().uuid('ID de partido inválido'),
  homeGoals: z.number().int().min(0, 'Mínimo 0 goles').max(20, 'Máximo 20 goles'),
  awayGoals: z.number().int().min(0, 'Mínimo 0 goles').max(20, 'Máximo 20 goles'),
})

export const matchSchema = z.object({
  homeTeam: z.string().min(1, 'Equipo local requerido'),
  awayTeam: z.string().min(1, 'Equipo visitante requerido'),
  group: z.string().min(1, 'Grupo requerido'),
  matchDate: z.string().datetime('Fecha inválida'),
})

export const resultSchema = z.object({
  homeGoals: z.number().int().min(0, 'Mínimo 0 goles').max(20, 'Máximo 20 goles'),
  awayGoals: z.number().int().min(0, 'Mínimo 0 goles').max(20, 'Máximo 20 goles'),
})

export const prizeSchema = z.object({
  position: z.number().int().min(1),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val : null))
    .refine((val) => val === null || /^https?:\/\/.+/.test(val), {
      message: 'URL de imagen inválida',
    }),
  conditions: z.string().min(1, 'Condiciones requeridas'),
  isPublished: z.boolean().default(true),
})

export const pointsConfigSchema = z.object({
  matchPoints: z.number().int().min(0, 'Mínimo 0 puntos'),
  semifinalistPoints: z.number().int().min(0, 'Mínimo 0 puntos'),
  finalistPoints: z.number().int().min(0, 'Mínimo 0 puntos'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PredictionInput = z.infer<typeof predictionSchema>
export type MatchInput = z.infer<typeof matchSchema>
export type ResultInput = z.infer<typeof resultSchema>
export type PrizeInput = z.infer<typeof prizeSchema>
export type PointsConfigInput = z.infer<typeof pointsConfigSchema>
