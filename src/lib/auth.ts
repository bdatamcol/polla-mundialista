'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema, loginSchema } from '@/lib/validations'
import type { RegisterInput, LoginInput } from '@/lib/validations'

const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)

  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      totalPoints: true,
      exactScores: true,
      correctWinners: true,
      createdAt: true,
    },
  })

  return user
}

export async function registerUser(data: RegisterInput) {
  const validation = registerSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    return { success: false, error: 'Este correo ya está registrado' }
  }

  const hashedPassword = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  })

  await createSession(user.id)

  return { success: true, user: { id: user.id, name: user.name, email: user.email } }
}

export async function loginUser(data: LoginInput) {
  const validation = loginSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  const isValidPassword = await verifyPassword(data.password, user.password)
  if (!isValidPassword) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  await createSession(user.id)

  return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

export async function logoutUser() {
  await destroySession()
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}
