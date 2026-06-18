import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// POST /api/admin/users/[id]/toggle-active
// Body: { isActive: boolean, blockReason?: string }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { isActive, blockReason } = await request.json()

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive debe ser boolean' }, { status: 400 })
    }

    // Prevenir que el admin se bloquee a sí mismo
    const currentUser = await getCurrentUser()
    if (currentUser?.id === id && !isActive) {
      return NextResponse.json(
        { error: 'No puedes desactivar tu propia cuenta' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive,
        blockedAt: isActive ? null : new Date(),
        blockReason: isActive ? null : (blockReason?.trim() || null),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        blockedAt: true,
        blockReason: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: isActive ? 'ACTIVATE_USER' : 'BLOCK_USER',
        userId: currentUser?.id,
        details: { targetUserId: id, blockReason: blockReason || null },
      },
    })

    revalidatePath('/admin/usuarios')

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Toggle active error:', error)
    return NextResponse.json({ error: 'Error al cambiar estado' }, { status: 500 })
  }
}