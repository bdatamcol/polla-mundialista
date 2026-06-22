'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Filter, Calendar, Trophy, CheckCircle2, XCircle, Clock, Edit3 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getMyPredictionsPaginated } from '@/actions/prediction-actions'
import { formatDate } from '@/lib/utils'
import type { MatchStatus } from '@/types'

interface PredictionRow {
  id: string
  homeGoals: number
  awayGoals: number
  points: number | null
  createdAt: Date
  match: {
    id: string
    homeTeam: string
    awayTeam: string
    homeGoals: number | null
    awayGoals: number | null
    group: string | null
    phase: string
    matchDate: Date
    status: MatchStatus
  }
}

interface PaginatedData {
  predictions: PredictionRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type StatusFilter = 'ALL' | 'PENDING' | 'LIVE' | 'FINISHED'

const STATUS_FILTERS: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'ALL', label: 'Todas', color: 'bg-accent/20 text-accent border-accent/30' },
  { value: 'PENDING', label: 'Pendientes', color: 'bg-warning/20 text-warning border-warning/30' },
  { value: 'LIVE', label: 'En Vivo', color: 'bg-error/20 text-error border-error/30' },
  { value: 'FINISHED', label: 'Terminadas', color: 'bg-success/20 text-success border-success/30' },
]

export function MyPredictionsTable({ initialData }: { initialData: PaginatedData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<PaginatedData>(initialData)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async (page: number, status: StatusFilter) => {
    setIsLoading(true)
    try {
      const result = await getMyPredictionsPaginated({
        page,
        pageSize: 20,
        status,
      })
      setData(result)
      // Actualizar URL sin recargar
      const params = new URLSearchParams(searchParams.toString())
      if (page > 1) params.set('page', String(page))
      else params.delete('page')
      if (status !== 'ALL') params.set('status', status)
      else params.delete('status')
      router.replace(`/perfil?${params.toString()}`, { scroll: false })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (newStatus: StatusFilter) => {
    setStatusFilter(newStatus)
    fetchData(1, newStatus)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > data.totalPages) return
    fetchData(newPage, statusFilter)
    // Scroll suave hacia la tabla
    document.getElementById('predictions-table')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Determinar el resultado de una predicción
  const getResult = (row: PredictionRow) => {
    const m = row.match
    if (m.status !== 'FINISHED') {
      return {
        icon: m.status === 'LIVE' ? Clock : Calendar,
        text: m.status === 'LIVE' ? 'En vivo' : 'Pendiente',
        color: m.status === 'LIVE' ? 'text-error' : 'text-warning',
        bg: m.status === 'LIVE' ? 'bg-error/10' : 'bg-warning/10',
        points: null,
      }
    }
    // Partido terminado: solo marcador exacto suma puntos
    if (row.homeGoals === m.homeGoals && row.awayGoals === m.awayGoals) {
      return {
        icon: CheckCircle2,
        text: 'Exacto',
        color: 'text-success',
        bg: 'bg-success/10',
        points: 5,
      }
    }

    // Cualquier otro caso (acertó ganador, perdió, empate) = 0 puntos
    return {
      icon: XCircle,
      text: 'Fallo',
      color: 'text-error',
      bg: 'bg-error/10',
      points: 0,
    }
  }

  const startIndex = (data.page - 1) * data.pageSize + 1
  const endIndex = Math.min(data.page * data.pageSize, data.total)

  return (
    <div id="predictions-table">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <Filter className="w-4 h-4" />
          Filtrar por:
        </div>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusChange(f.value)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              statusFilter === f.value
                ? f.color + ' ring-2 ring-offset-2 ring-offset-background ring-current'
                : 'bg-surface-light/30 text-text-secondary border-surface-light hover:bg-surface-light/50'
            } disabled:opacity-50`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-text-secondary text-sm">
          {data.total} {data.total === 1 ? 'predicción' : 'predicciones'}
        </span>
      </div>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-light text-left">
                <th className="pb-3 pr-4 text-text-secondary text-xs font-medium uppercase tracking-wider">Fecha</th>
                <th className="pb-3 pr-4 text-text-secondary text-xs font-medium uppercase tracking-wider">Partido</th>
                <th className="pb-3 pr-4 text-text-secondary text-xs font-medium uppercase tracking-wider text-center">Tu Pred.</th>
                <th className="pb-3 pr-4 text-text-secondary text-xs font-medium uppercase tracking-wider text-center">Resultado</th>
                <th className="pb-3 pr-4 text-text-secondary text-xs font-medium uppercase tracking-wider">Estado</th>
                <th className="pb-3 pr-4 text-text-secondary text-xs font-medium uppercase tracking-wider text-center">Pts</th>
                <th className="pb-3 text-text-secondary text-xs font-medium uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className={isLoading ? 'opacity-50' : ''}>
              {data.predictions.map((p) => {
                const result = getResult(p)
                const ResultIcon = result.icon
                const isFinished = p.match.status === 'FINISHED'
                return (
                  <tr
                    key={p.id}
                    className="border-b border-surface-light/50 hover:bg-surface-light/30 transition-colors"
                  >
                    <td className="py-3 pr-4 text-text-secondary text-xs whitespace-nowrap">
                      {formatDate(p.match.matchDate)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">
                          {p.match.homeTeam}
                          <span className="mx-2 text-text-secondary">vs</span>
                          {p.match.awayTeam}
                        </span>
                        <span className="text-text-secondary text-xs">
                          {p.match.group && `${p.match.group} • `}
                          {p.match.phase !== 'GROUP' ? p.match.phase : 'Grupos'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className="font-mono font-bold text-white text-lg">
                        {p.homeGoals} - {p.awayGoals}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {isFinished && p.match.homeGoals !== null ? (
                        <span className="font-mono font-bold text-accent text-lg">
                          {p.match.homeGoals} - {p.match.awayGoals}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          p.match.status === 'LIVE'
                            ? 'error'
                            : p.match.status === 'FINISHED'
                              ? 'success'
                              : 'default'
                        }
                        className="text-xs"
                      >
                        <ResultIcon className="w-3 h-3 mr-1" />
                        {result.text}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {result.points !== null ? (
                        <span
                          className={`font-mono font-bold ${
                            result.points === 5
                              ? 'text-success'
                              : 'text-text-secondary'
                          }`}
                        >
                          +{result.points}
                        </span>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {p.match.status !== 'FINISHED' ? (
                        <Link href={`/predicciones/${p.match.id}`}>
                          <Button size="sm" variant="ghost" title="Editar predicción">
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-text-secondary text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {data.predictions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-text-secondary">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No tienes predicciones en esta categoría.</p>
                      <Link href="/predicciones" className="text-accent hover:underline text-sm">
                        Ir a predecir
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Paginación */}
      {data.totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-secondary text-sm">
            Mostrando <span className="text-white font-medium">{startIndex}</span>-
            <span className="text-white font-medium">{endIndex}</span> de{' '}
            <span className="text-white font-medium">{data.total}</span>
          </p>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </Button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                let pageNum
                if (data.totalPages <= 5) {
                  pageNum = i + 1
                } else if (data.page <= 3) {
                  pageNum = i + 1
                } else if (data.page >= data.totalPages - 2) {
                  pageNum = data.totalPages - 4 + i
                } else {
                  pageNum = data.page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      data.page === pageNum
                        ? 'bg-accent text-background'
                        : 'text-text-secondary hover:bg-surface-light'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page === data.totalPages || isLoading}
            >
              <span className="hidden sm:inline mr-1">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}