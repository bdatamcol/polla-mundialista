import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'

// DELETE /api/admin/cleanup-tbd - Elimina partidos TBD (To Be Determined)
export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Eliminar partidos TBD y sus predicciones asociadas
    const deletedMatches = await prisma.match.deleteMany({
      where: {
        OR: [
          { homeTeam: 'TBD' },
          { awayTeam: 'TBD' },
          { homeTeamFull: 'TBD' },
          { awayTeamFull: 'TBD' },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: `${deletedMatches.count} partidos TBD eliminados`,
      deleted: deletedMatches.count,
    })
  } catch (error) {
    console.error('Error limpiando TBD:', error)
    return NextResponse.json({ error: 'Error al limpiar' }, { status: 500 })
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tbdMatches = await prisma.match.count({
      where: {
        OR: [
          { homeTeam: 'TBD' },
          { awayTeam: 'TBD' },
        ],
      },
    })

    const totalMatches = await prisma.match.count()

    return NextResponse.json({
      tbdMatches,
      totalMatches,
      realMatches: totalMatches - tbdMatches,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
