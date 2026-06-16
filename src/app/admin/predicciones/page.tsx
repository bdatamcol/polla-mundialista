import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Target, TrendingUp } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminPrediccionesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  // Get all predictions with user and match info
  const predictions = await prisma.prediction.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      match: {
        select: { id: true, homeTeam: true, awayTeam: true, group: true, homeGoals: true, awayGoals: true },
      },
    },
    orderBy: [
      { match: { matchDate: 'desc' } },
      { user: { name: 'asc' } },
    ],
  })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl text-white">
            VER <span className="text-accent">PREDICCIONES</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {predictions.length} predicciones en total
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead>Predicción</TableHead>
                <TableHead>Resultado Real</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => {
                const isExact = prediction.isExactScore
                const isWinner = prediction.isCorrectWinner

                return (
                  <TableRow key={prediction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{prediction.user.name}</p>
                        <p className="text-xs text-text-secondary">{prediction.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{prediction.match.homeTeam} vs {prediction.match.awayTeam}</p>
                        <p className="text-xs text-text-secondary">{prediction.match.group}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold">
                        {prediction.homeGoals} - {prediction.awayGoals}
                      </span>
                    </TableCell>
                    <TableCell>
                      {prediction.match.homeGoals !== null ? (
                        <span className="font-mono font-bold text-accent">
                          {prediction.match.homeGoals} - {prediction.match.awayGoals}
                        </span>
                      ) : (
                        <span className="text-text-secondary">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-accent">
                          {prediction.points}
                        </span>
                        {isExact && (
                          <Badge variant="gold" className="text-xs">EXACTO</Badge>
                        )}
                        {isWinner && !isExact && (
                          <Badge variant="success" className="text-xs">GANADOR</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {prediction.points > 0 ? (
                        <Badge variant="success">Puntuada</Badge>
                      ) : prediction.match.homeGoals !== null ? (
                        <Badge variant="error">Incorrecta</Badge>
                      ) : (
                        <Badge variant="default">Pendiente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {predictions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                    No hay predicciones registradas aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
