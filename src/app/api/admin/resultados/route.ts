import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { loadResults } from '@/actions/admin-actions'

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { matchId, homeGoals, awayGoals } = data

    if (!matchId || homeGoals === undefined || awayGoals === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await loadResults(matchId, { homeGoals, awayGoals })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
