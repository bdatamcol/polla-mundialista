import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getPrizeById, updatePrize, deletePrize } from '@/actions/admin-actions'

interface RouteContext {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prize = await getPrizeById(params.id)
    if (!prize) {
      return NextResponse.json({ error: 'Premio no encontrado' }, { status: 404 })
    }
    return NextResponse.json(prize)
  } catch (error) {
    console.error('Get prize error:', error)
    return NextResponse.json({ error: 'Error al obtener premio' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const result = await updatePrize(params.id, data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update prize error:', error)
    return NextResponse.json({ error: 'Error al actualizar premio' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await deletePrize(params.id)
    if (!result?.success) {
      return NextResponse.json({ error: result?.error || 'Error al eliminar premio' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete prize error:', error)
    return NextResponse.json({ error: 'Error al eliminar premio' }, { status: 500 })
  }
}