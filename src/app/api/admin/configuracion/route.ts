import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { updatePointsConfig, recalculateAllPoints } from '@/actions/admin-actions'

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Check if it's a recalculate request
    if (data.action === 'recalculate') {
      const result = await recalculateAllPoints()
      return NextResponse.json(result)
    }

    // Otherwise, it's a config update
    const result = await updatePointsConfig(data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
