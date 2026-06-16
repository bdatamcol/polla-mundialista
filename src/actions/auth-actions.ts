'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser, logoutUser, loginUser, registerUser } from '@/lib/auth'

export { loginUser, registerUser, logoutUser }

export async function getUser() {
  return getCurrentUser()
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      totalPoints: true,
      exactScores: true,
      correctWinners: true,
      createdAt: true,
      _count: {
        select: { predictions: true },
      },
    },
  })
}
