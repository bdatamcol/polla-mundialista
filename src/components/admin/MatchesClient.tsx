'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatDateTime } from '@/lib/utils'
import type { Match } from '@/types'

interface MatchesClientProps {
  matches: Match[]
}

export function MatchesClient({ matches }: MatchesClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [deleteMatch, setDeleteMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    group: '',
    matchDate: '',
  })

  const openCreateModal = () => {
    setEditingMatch(null)
    setFormData({ homeTeam: '', awayTeam: '', group: '', matchDate: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (match: Match) => {
    setEditingMatch(match)
    setFormData({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      group: match.group,
      matchDate: new Date(match.matchDate).toISOString().slice(0, 16),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/matches', {
        method: editingMatch ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingMatch?.id,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteMatch) return
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/matches?id=${deleteMatch.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeleteMatch(null)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusConfig = {
    PENDING: { label: 'Pendiente', variant: 'success' as const },
    LIVE: { label: 'En Vivo', variant: 'warning' as const },
    FINISHED: { label: 'Finalizado', variant: 'default' as const },
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-white">
            GESTIONAR <span className="text-accent">PARTIDOS</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {matches.length} partidos en total
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Partido
        </Button>
      </div>

      <Card>
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
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell className="font-medium">{match.homeTeam}</TableCell>
                <TableCell className="font-medium">{match.awayTeam}</TableCell>
                <TableCell>{match.group}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(match.matchDate)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[match.status].variant}>
                    {statusConfig[match.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(match)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteMatch(match)}
                      className="text-error hover:bg-error/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {matches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                  No hay partidos creados aún.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMatch ? 'Editar Partido' : 'Nuevo Partido'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Equipo Local"
            value={formData.homeTeam}
            onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
            required
          />
          <Input
            label="Equipo Visitante"
            value={formData.awayTeam}
            onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
            required
          />
          <Input
            label="Grupo"
            value={formData.group}
            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
            placeholder="Grupo A, Octavos, Final..."
            required
          />
          <Input
            type="datetime-local"
            label="Fecha y Hora"
            value={formData.matchDate}
            onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
            required
          />
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {editingMatch ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteMatch}
        onClose={() => setDeleteMatch(null)}
        onConfirm={handleDelete}
        title="Eliminar Partido"
        message={`¿Estás seguro de eliminar el partido ${deleteMatch?.homeTeam} vs ${deleteMatch?.awayTeam}? Esta acción eliminará también todas las predicciones asociadas.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  )
}
