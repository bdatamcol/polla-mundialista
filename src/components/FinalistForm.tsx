'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Check, X, Search, ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { saveFinalistPrediction } from '@/actions/finalist-actions'
import { getFlagUrl, getFlagEmoji } from '@/lib/flags'

interface Team {
  name: string
  full: string
  tla: string
  flag: string | null
  crest: string | null
  iso2: string | null
}

interface FinalistFormProps {
  teams: Team[]
  initialPicks: { semifinalists: string[]; finalists: string[] }
  locked: boolean
  hasExistingPrediction: boolean
}

export function FinalistForm({ teams, initialPicks, locked, hasExistingPrediction }: FinalistFormProps) {
  const router = useRouter()
  const [semis, setSemis] = useState<string[]>(
    initialPicks.semifinalists.length === 4 ? initialPicks.semifinalists : ['', '', '', '']
  )
  const [finals, setFinals] = useState<string[]>(
    initialPicks.finalists.length === 2 ? initialPicks.finalists : ['', '']
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pickerOpen, setPickerOpen] = useState<{
    category: 'semi' | 'final'
    index: number
  } | null>(null)

  const getTeamById = (tla: string) => teams.find((t) => t.tla === tla)

  const handleSelect = (tla: string) => {
    if (!pickerOpen) return
    const { category, index } = pickerOpen
    setError(null)
    setSuccess(false)

    if (category === 'semi') {
      const newSemis = [...semis]
      newSemis[index] = tla
      setSemis(newSemis)
      // Si el equipo seleccionado estaba como finalista, limpiarlo
      if (finals.includes(tla)) {
        setFinals(finals.map((f) => (f === tla ? '' : f)))
      }
    } else {
      const newFinals = [...finals]
      newFinals[index] = tla
      setFinals(newFinals)
    }
    setPickerOpen(null)
  }

  const handleClear = (category: 'semi' | 'final', index: number) => {
    if (category === 'semi') {
      const newSemis = [...semis]
      newSemis[index] = ''
      setSemis(newSemis)
    } else {
      const newFinals = [...finals]
      newFinals[index] = ''
      setFinals(newFinals)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(false)

    if (semis.filter(Boolean).length !== 4) {
      setError('Selecciona exactamente 4 semifinalistas')
      return
    }
    if (finals.filter(Boolean).length !== 2) {
      setError('Selecciona exactamente 2 finalistas')
      return
    }
    if (new Set(semis).size !== 4) {
      setError('Los semifinalistas deben ser diferentes')
      return
    }
    if (new Set(finals).size !== 2) {
      setError('Los finalistas deben ser diferentes')
      return
    }
    for (const finalist of finals) {
      if (finalist && !semis.includes(finalist)) {
        setError(`El finalista debe estar entre tus semifinalistas`)
        return
      }
    }

    setIsLoading(true)
    try {
      const result = await saveFinalistPrediction({
        semifinalists: semis,
        finalists: finals,
      })
      if (result.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error || 'Error al guardar')
      }
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* SEMIFINALISTAS */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary-light" />
          <h2 className="font-display text-xl text-white">SEMIFINALISTAS (4)</h2>
          <span className="ml-auto text-sm text-text-secondary">
            {semis.filter(Boolean).length}/4 seleccionados
          </span>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          Elige los 4 equipos que crees que llegarán a las semifinales. Cada acierto = 10 pts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {semis.map((tla, index) => (
            <TeamSlot
              key={`semi-${index}`}
              index={index + 1}
              team={getTeamById(tla)}
              onClick={() => !locked && setPickerOpen({ category: 'semi', index })}
              onClear={() => handleClear('semi', index)}
              disabled={locked}
            />
          ))}
        </div>
      </Card>

      {/* FINALISTAS */}
      <Card className="border-accent/30">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl text-accent">FINALISTAS (2)</h2>
          <span className="ml-auto text-sm text-text-secondary">
            {finals.filter(Boolean).length}/2 seleccionados
          </span>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          Elige los 2 equipos que crees que jugarán la final. Cada acierto = 20 pts.
          <br />
          <span className="text-xs text-warning">
            ⚠️ Los finalistas deben estar entre tus semifinalistas.
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {finals.map((tla, index) => (
            <TeamSlot
              key={`final-${index}`}
              index={index + 1}
              team={getTeamById(tla)}
              onClick={() => !locked && setPickerOpen({ category: 'final', index })}
              onClear={() => handleClear('final', index)}
              disabled={locked}
              highlight
            />
          ))}
        </div>
      </Card>

      {/* Mensajes */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3 text-error text-sm flex items-center gap-2">
          <X className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-success text-sm flex items-center gap-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          ¡Predicción guardada con éxito!
        </div>
      )}

      {/* Submit */}
      {!locked && (
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {hasExistingPrediction ? 'Actualizar Predicción' : 'Guardar Predicción'}
          </Button>
        </div>
      )}

      {/* MODAL: Selector de equipos */}
      {pickerOpen && (
        <TeamPickerModal
          teams={teams}
          excludeTlas={
            pickerOpen.category === 'semi'
              ? semis.filter((t, i) => t && i !== pickerOpen.index)
              : finals.filter((t, i) => t && i !== pickerOpen.index)
          }
          allowedTlas={
            pickerOpen.category === 'final' ? semis : undefined
          }
          onSelect={handleSelect}
          onClose={() => setPickerOpen(null)}
          category={pickerOpen.category}
          index={pickerOpen.index + 1}
          semifinalists={semis}
          finalists={finals}
          currentPicks={pickerOpen.category === 'semi' ? semis : finals}
          currentIndex={pickerOpen.index}
        />
      )}
    </div>
  )
}

interface TeamSlotProps {
  index: number
  team: Team | undefined
  onClick: () => void
  onClear: () => void
  disabled: boolean
  highlight?: boolean
}

function TeamSlot({ index, team, onClick, onClear, disabled, highlight }: TeamSlotProps) {
  const flagUrl = team ? getFlagUrl(team.iso2, team.tla, team.full) : null

  if (team) {
    return (
      <div
        className={`p-3 rounded-lg border-2 ${
          highlight ? 'border-accent/30 bg-accent/5' : 'border-primary/30 bg-primary/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center overflow-hidden flex-shrink-0">
            {flagUrl ? (
              <img src={flagUrl} alt={team.full} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{getFlagEmoji(team.tla)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary">Selección {index}</p>
            <p className="font-heading font-bold text-white truncate">{team.name}</p>
            <p className="text-xs text-text-secondary font-mono">{team.tla}</p>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="p-2 hover:bg-surface-light rounded-lg transition-colors"
              aria-label="Cambiar"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-lg border-2 border-dashed text-left transition-colors ${
        highlight
          ? 'border-accent/30 hover:border-accent/60'
          : 'border-primary/30 hover:border-primary/60'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <p className="text-xs text-text-secondary">Selección {index}</p>
      <p className="font-heading text-text-secondary flex items-center gap-1">
        Seleccionar equipo...
        <ChevronDown className="w-4 h-4" />
      </p>
    </button>
  )
}

interface TeamPickerModalProps {
  teams: Team[]
  excludeTlas: string[]
  allowedTlas?: string[] // Si está definido, solo se permiten estos TLAs
  onSelect: (tla: string) => void
  onClose: () => void
  category: 'semi' | 'final'
  index: number
  semifinalists: string[]
  finalists: string[]
  currentPicks: string[]
  currentIndex: number
}

function TeamPickerModal({
  teams,
  excludeTlas,
  allowedTlas,
  onSelect,
  onClose,
  category,
  index,
  semifinalists,
}: TeamPickerModalProps) {
  const [search, setSearch] = useState('')

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const filteredTeams = teams
    .filter((t) => {
      // Si hay una lista permitida, solo permitir esos equipos
      if (allowedTlas && !allowedTlas.includes(t.tla)) return false
      // Excluir equipos ya seleccionados en otros slots
      if (excludeTlas.includes(t.tla)) return false
      return true
    })
    .filter((t) => {
      if (!search.trim()) return true
      const s = search.toLowerCase()
      return (
        t.name.toLowerCase().includes(s) ||
        t.tla.toLowerCase().includes(s) ||
        t.full.toLowerCase().includes(s)
      )
    })

  const title = category === 'semi' ? 'Selecciona un Semifinalista' : 'Selecciona un Finalista'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] bg-surface border border-surface-light rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-light flex-shrink-0">
          <div>
            <h3 className="font-display text-lg text-white">{title}</h3>
            <p className="text-xs text-text-secondary">
              Selección {index} · {filteredTeams.length} equipos disponibles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-4 border-b border-surface-light flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar equipo por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2 bg-background border border-surface-light rounded-lg text-white text-sm placeholder-text-secondary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Lista de equipos */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              {category === 'final' && semifinalists.filter(Boolean).length < 4
                ? 'Primero debes completar tus 4 semifinalistas antes de elegir finalistas.'
                : search.trim()
                ? 'No se encontraron equipos con ese nombre'
                : 'No hay equipos disponibles'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filteredTeams.map((t) => {
                const flagUrl = getFlagUrl(t.iso2, t.tla, t.full)
                return (
                  <button
                    key={t.tla}
                    type="button"
                    onClick={() => onSelect(t.tla)}
                    className="flex items-center gap-3 p-3 hover:bg-surface-light rounded-lg text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                      {flagUrl ? (
                        <img src={flagUrl} alt={t.full} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{getFlagEmoji(t.tla)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate font-medium">{t.name}</p>
                      <p className="text-xs text-text-secondary font-mono">{t.tla}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-light flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
