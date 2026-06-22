'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Filter, Calendar, Trophy, CheckCircle2, XCircle, Clock, Edit3 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getMyPredictionsPaginated } from '@/actions/prediction-actions'
import { getFlagEmoji, getFlagUrl } from '@/lib/flags'
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
    homeTeamFull?: string | null
    awayTeamFull?: string | null
    homeTeamIso2?: string | null
    awayTeamIso2?: string | null
    homeTeamTla?: string | null
    awayTeamTla?: string | null
    homeTeamCrest?: string | null
    awayTeamCrest?: string | null
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
  const getStatusBadgeVariant = (status: MatchStatus) =>
    status === 'LIVE' ? 'error' : status === 'FINISHED' ? 'success' : 'default'

  return (
    <div id="predictions-table">
      {/* Filtros */}
      <Card className="mb-5 border-white/10 bg-gradient-to-br from-white/6 via-primary-light/10 to-white/6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Filter className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">Filtrar</p>
              <p className="text-sm text-text-secondary">Organiza tu historial por estado</p>
            </div>
          </div>

          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-secondary">
            <span className="font-mono text-base font-bold text-white">{data.total}</span>
            <span className="ml-2">{data.total === 1 ? 'predicción' : 'predicciones'}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value)}
              disabled={isLoading}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === f.value
                  ? `${f.color} shadow-lg shadow-primary-dark/20`
                  : 'border-white/10 bg-white/5 text-text-secondary hover:border-accent/30 hover:bg-white/10 hover:text-white'
              } disabled:opacity-50`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden border-white/10">
        {data.predictions.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No tienes predicciones en esta categoría.</p>
            <Link href="/predicciones" className="text-accent hover:underline text-sm">
              Ir a predecir
            </Link>
          </div>
        ) : (
          <>
            <div className={`space-y-3 p-3 md:hidden ${isLoading ? 'opacity-50' : ''}`}>
              {data.predictions.map((p) => {
                const result = getResult(p)
                const ResultIcon = result.icon
                const isFinished = p.match.status === 'FINISHED'
                const homeFlagUrl =
                  p.match.homeTeamCrest ||
                  getFlagUrl(p.match.homeTeamIso2, p.match.homeTeamTla, p.match.homeTeamFull || p.match.homeTeam)
                const awayFlagUrl =
                  p.match.awayTeamCrest ||
                  getFlagUrl(p.match.awayTeamIso2, p.match.awayTeamTla, p.match.awayTeamFull || p.match.awayTeam)
                const homeEmoji = getFlagEmoji(p.match.homeTeamTla)
                const awayEmoji = getFlagEmoji(p.match.awayTeamTla)

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg shadow-primary-dark/10"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                          {formatDate(p.match.matchDate)}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {p.match.group && `${p.match.group} • `}
                          {p.match.phase !== 'GROUP' ? p.match.phase : 'Grupos'}
                        </p>
                      </div>

                      <Badge
                        variant={getStatusBadgeVariant(p.match.status)}
                        className={`text-xs ${result.bg} ${result.color} border-transparent`}
                      >
                        <ResultIcon className="w-3 h-3 mr-1" />
                        {result.text}
                      </Badge>
                    </div>

                    <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
                            {homeFlagUrl ? (
                              <img
                                src={homeFlagUrl}
                                alt={p.match.homeTeamFull || p.match.homeTeam}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl">{homeEmoji}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium leading-tight text-text-secondary">
                            {p.match.homeTeam}
                          </p>
                        </div>

                        <div className="pt-4">
                          <span className="inline-flex rounded-full bg-accent/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                            VS
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
                            {awayFlagUrl ? (
                              <img
                                src={awayFlagUrl}
                                alt={p.match.awayTeamFull || p.match.awayTeam}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl">{awayEmoji}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium leading-tight text-text-secondary">
                            {p.match.awayTeam}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Tu Pred.
                        </p>
                        <span className="inline-flex min-w-[78px] items-center justify-center rounded-xl bg-white/6 px-3 py-2 font-mono text-lg font-bold text-white">
                          {p.homeGoals} - {p.awayGoals}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Resultado
                        </p>
                        {isFinished && p.match.homeGoals !== null ? (
                          <span className="inline-flex min-w-[78px] items-center justify-center rounded-xl bg-accent/10 px-3 py-2 font-mono text-lg font-bold text-accent">
                            {p.match.homeGoals} - {p.match.awayGoals}
                          </span>
                        ) : (
                          <span className="inline-flex min-w-[78px] items-center justify-center rounded-xl bg-white/6 px-3 py-2 text-sm text-text-secondary">
                            —
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                          Puntos
                        </p>
                        {result.points !== null ? (
                          <span
                            className={`mt-1 inline-flex min-w-[56px] items-center justify-center rounded-full px-2.5 py-1 font-mono text-sm font-bold ${
                              result.points === 5
                                ? 'bg-success/12 text-success'
                                : 'bg-white/6 text-text-secondary'
                            }`}
                          >
                            +{result.points}
                          </span>
                        ) : (
                          <span className="mt-1 inline-flex min-w-[56px] items-center justify-center rounded-full bg-white/6 px-2.5 py-1 text-sm text-text-secondary">
                            —
                          </span>
                        )}
                      </div>

                      {p.match.status !== 'FINISHED' ? (
                        <Link href={`/predicciones/${p.match.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-white/10 bg-white/5 px-4"
                          >
                            <Edit3 className="mr-2 h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-text-secondary">Partido finalizado</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] border-separate border-spacing-0 border-spacing-y-3 px-4">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-4 py-4 text-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]">Fecha</th>
                <th className="px-4 py-4 text-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]">Partido</th>
                <th className="w-[130px] px-4 py-4 text-center text-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]">Tu Pred.</th>
                <th className="w-[130px] px-4 py-4 text-center text-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]">Resultado</th>
                <th className="px-4 py-4 text-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]">Estado</th>
                <th className="w-[88px] px-4 py-4 text-center text-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]">Pts</th>
                <th className="w-[76px] px-4 py-4 text-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]"></th>
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
                    className="transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <td className="rounded-l-2xl border-y border-l border-white/10 bg-white/[0.03] px-4 py-4 text-text-secondary text-xs whitespace-nowrap">
                      {formatDate(p.match.matchDate)}
                    </td>
                    <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold text-sm leading-snug">
                          {p.match.homeTeam}
                          <span className="mx-2 text-text-secondary">vs</span>
                          {p.match.awayTeam}
                        </span>
                        <span className="mt-1 text-text-secondary text-xs">
                          {p.match.group && `${p.match.group} • `}
                          {p.match.phase !== 'GROUP' ? p.match.phase : 'Grupos'}
                        </span>
                      </div>
                    </td>
                    <td className="w-[130px] border-y border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                      <span className="inline-flex min-w-[96px] whitespace-nowrap items-center justify-center rounded-xl bg-white/6 px-3 py-2 font-mono text-lg font-bold text-white">
                        {p.homeGoals} - {p.awayGoals}
                      </span>
                    </td>
                    <td className="w-[130px] border-y border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                      {isFinished && p.match.homeGoals !== null ? (
                        <span className="inline-flex min-w-[96px] whitespace-nowrap items-center justify-center rounded-xl bg-accent/10 px-3 py-2 font-mono text-lg font-bold text-accent">
                          {p.match.homeGoals} - {p.match.awayGoals}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-sm">—</span>
                      )}
                    </td>
                    <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4">
                      <Badge
                        variant={getStatusBadgeVariant(p.match.status)}
                        className={`text-xs ${result.bg} ${result.color} border-transparent`}
                      >
                        <ResultIcon className="w-3 h-3 mr-1" />
                        {result.text}
                      </Badge>
                    </td>
                    <td className="border-y border-white/10 bg-white/[0.03] px-4 py-4 text-center">
                      {result.points !== null ? (
                        <span
                          className={`inline-flex min-w-[52px] items-center justify-center rounded-full px-2.5 py-1 font-mono text-sm font-bold ${
                            result.points === 5
                              ? 'bg-success/12 text-success'
                              : 'text-text-secondary'
                          }`}
                        >
                          +{result.points}
                        </span>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="rounded-r-2xl border-y border-r border-white/10 bg-white/[0.03] px-4 py-4">
                      {p.match.status !== 'FINISHED' ? (
                        <Link href={`/predicciones/${p.match.id}`}>
                          <Button size="sm" variant="ghost" title="Editar predicción" className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
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
            </tbody>
          </table>
        </div>
          </>
        )}
      </Card>

      {/* Paginación */}
      {data.totalPages > 1 && (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-text-secondary text-sm">
            Mostrando <span className="text-white font-medium">{startIndex}</span>-
            <span className="text-white font-medium">{endIndex}</span> de{' '}
            <span className="text-white font-medium">{data.total}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1 || isLoading}
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </Button>

            <div className="flex items-center gap-1 px-1">
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
                    className={`h-9 w-9 rounded-xl text-sm font-semibold transition-colors ${
                      data.page === pageNum
                        ? 'bg-accent text-background shadow-lg shadow-accent/20'
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
              className="rounded-xl"
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
