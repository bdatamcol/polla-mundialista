'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, CheckCircle } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatDateTime } from '@/lib/utils'
import type { Match } from '@/types'

interface ResultadosClientProps {
  matches: Match[]
}

export function ResultadosClient({ matches }: ResultadosClientProps) {
  const router = useRouter()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmMatch, setConfirmMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [resultData, setResultData] = useState({
    homeGoals: '',
    awayGoals: '',
  })

  const pendingMatches = matches.filter((m) => m.status === 'PENDING' || m.status === 'LIVE')
  const finishedMatches = matches.filter((m) => m.status === 'FINISHED')

  const openResultModal = (match: Match) => {
    setSelectedMatch(match)
    setResultData({
      homeGoals: match.homeGoals?.toString() ?? '',
      awayGoals: match.awayGoals?.toString() ?? '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMatch) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          homeGoals: parseInt(resultData.homeGoals),
          awayGoals: parseInt(resultData.awayGoals),
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setConfirmMatch(null)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-white">
          CARGAR <span className="text-accent">RESULTADOS</span>
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Selecciona un partido pendiente para cargar el resultado final.
        </p>
      </div>

      {/* Pending Matches */}
      <Card className="mb-8">
        <CardTitle className="mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-warning" />
          Partidos Pendientes de Resultado
        </CardTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipo Local</TableHead>
              <TableHead>Equipo Visitante</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingMatches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="font-medium">{match.homeTeam}</TableCell>
                <TableCell className="font-medium">{match.awayTeam}</TableCell>
                <TableCell>{match.group}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(match.matchDate)}
                </TableCell>
                <TableCell>
                  <Badge variant={match.status === 'LIVE' ? 'warning' : 'success'}>
                    {match.status === 'LIVE' ? 'En Vivo' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => openResultModal(match)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Cargar Resultado
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pendingMatches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                  No hay partidos pendientes de resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Finished Matches */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          Partidos con Resultado
        </CardTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipo Local</TableHead>
              <TableHead>Equipo Visitante</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {finishedMatches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="font-medium">{match.homeTeam}</TableCell>
                <TableCell className="font-medium">{match.awayTeam}</TableCell>
                <TableCell>{match.group}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(match.matchDate)}
                </TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-accent">
                    {match.homeGoals} - {match.awayGoals}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => openResultModal(match)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {finishedMatches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                  No hay partidos finalizados aún.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cargar Resultado Final"
      >
        {selectedMatch && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-text-secondary text-sm mb-2">{selectedMatch.group}</p>
              <p className="font-heading text-xl font-bold text-text-primary">
                {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 max-w-[140px]">
                <Input
                  type="number"
                  label={selectedMatch.homeTeam}
                  min={0}
                  max={20}
                  value={resultData.homeGoals}
                  onChange={(e) => setResultData({ ...resultData, homeGoals: e.target.value })}
                  className="text-center text-2xl font-mono font-bold"
                  required
                />
              </div>
              <span className="text-3xl font-bold text-text-secondary pt-6">-</span>
              <div className="flex-1 max-w-[140px]">
                <Input
                  type="number"
                  label={selectedMatch.awayTeam}
                  min={0}
                  max={20}
                  value={resultData.awayGoals}
                  onChange={(e) => setResultData({ ...resultData, awayGoals: e.target.value })}
                  className="text-center text-2xl font-mono font-bold"
                  required
                />
              </div>
            </div>

            <p className="text-center text-warning text-sm">
              ⚠️ Al cargar el resultado se calcularán los puntos de todas las predicciones.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Guardar Resultado
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
