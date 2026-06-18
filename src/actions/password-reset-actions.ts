'use server'

import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

const TOKEN_EXPIRATION_MS = 60 * 60 * 1000 // 1 hora

/**
 * Solicita un token de restablecimiento de contraseña.
 * - Si el email existe: crea token y lo retorna (sin enviar email)
 * - Si el email NO existe: retorna éxito falso pero genérico
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Email inválido' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, isActive: true },
  })

  // Por seguridad, siempre retornamos el mismo mensaje genérico
  // No revelamos si el email existe o no
  if (!user) {
    // Retornar éxito pero sin token (no se debe saber si existe)
    return { success: true }
  }

  if (!user.isActive) {
    return { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' }
  }

  // Invalidar tokens previos no usados para este usuario
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() },
  })

  // Crear nuevo token (32 bytes = 64 chars hex)
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS)

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  })

  return { success: true, token }
}

/**
 * Valida un token sin consumirlo.
 * Retorna info del usuario si el token es válido.
 */
export async function validateResetToken(token: string): Promise<{
  valid: boolean
  email?: string
  name?: string
  error?: string
}> {
  if (!token) {
    return { valid: false, error: 'Token inválido' }
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { email: true, name: true, isActive: true } } },
  })

  if (!record) {
    return { valid: false, error: 'Token inválido o no existe' }
  }

  if (record.usedAt) {
    return { valid: false, error: 'Este enlace ya fue utilizado' }
  }

  if (record.expiresAt < new Date()) {
    return { valid: false, error: 'Este enlace ha expirado. Solicita uno nuevo.' }
  }

  if (!record.user.isActive) {
    return { valid: false, error: 'Tu cuenta está desactivada' }
  }

  return {
    valid: true,
    email: record.user.email,
    name: record.user.name,
  }
}

/**
 * Cambia la contraseña usando un token válido.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'Token inválido' }
  }

  // Validar password mínimo
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (!/[A-Z]/.test(newPassword)) {
    return { success: false, error: 'La contraseña debe tener al menos una mayúscula' }
  }
  if (!/[0-9]/.test(newPassword)) {
    return { success: false, error: 'La contraseña debe tener al menos un número' }
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!record) {
    return { success: false, error: 'Token inválido' }
  }

  if (record.usedAt) {
    return { success: false, error: 'Este enlace ya fue utilizado' }
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: 'Este enlace ha expirado' }
  }

  // Hashear nueva contraseña y actualizar usuario + marcar token como usado
  const hashedPassword = await hashPassword(newPassword)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return { success: true }
}