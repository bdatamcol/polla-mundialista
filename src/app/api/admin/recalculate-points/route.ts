import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { recalculateAllPoints } from '@/actions/admin-actions'

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await recalculateAllPoints()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Recalculate error:', error)
    return NextResponse.json({ error: 'Error al recalcular puntos' }, { status: 500 })
  }
}