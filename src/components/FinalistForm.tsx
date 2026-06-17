'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Check, X } from 'lucide-react'
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
    initialPicks.semifinalists.length === 4
      ? initialPicks.semifinalists
      : ['', '', '', '']
  )
  const [finals, setFinals] = useState<string[]>(
    initialPicks.finalists.length === 2 ? initialPicks.finalists : ['', '']
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Equipos disponibles (excluyendo los ya seleccionados en semis para la lista de semis,
  // pero permitiendo reutilizar para finalists)
  const availableForSemis = teams.filter((t) => !semis.includes(t.tla) || semis.includes(t.tla))
  const availableForFinals = teams.filter((t) => !finals.includes(t.tla) || finals.includes(t.tla))

  const selectTeam = (category: 'semi' | 'final', index: number, tla: string) => {
    setError(null)
    setSuccess(false)
    if (category === 'semi') {
      const newSemis = [...semis]
      newSemis[index] = tla
      setSemis(newSemis)
      // Si el finalista en este slot coincide, limpiar
      if (finals.includes(tla)) {
        setFinals(finals.map((f) => (f === tla ? '' : f)))
      }
    } else {
      const newFinals = [...finals]
      newFinals[index] = tla
      setFinals(newFinals)
    }
  }

  const clearSlot = (category: 'semi' | 'final', index: number) => {
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
        setError(`El finalista ${finalist} debe estar entre tus semifinalistas`)
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

  const getTeamById = (tla: string) => teams.find((t) => t.tla === tla)

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
          {semis.map((tla, index) => {
            const team = getTeamById(tla)
            return (
              <TeamSlot
                key={`semi-${index}`}
                index={index + 1}
                team={team}
                teams={availableForSemis}
                selectedTlas={semis}
                onSelect={(t) => selectTeam('semi', index, t)}
                onClear={() => clearSlot('semi', index)}
                disabled={locked}
              />
            )
          })}
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
          {finals.map((tla, index) => {
            const team = getTeamById(tla)
            return (
              <TeamSlot
                key={`final-${index}`}
                index={index + 1}
                team={team}
                teams={teams.filter((t) => t.tla === tla || (!semis.includes(t.tla) || t.tla === ''))}
                selectedTlas={finals}
                onSelect={(t) => selectTeam('final', index, t)}
                onClear={() => clearSlot('final', index)}
                disabled={locked}
                highlight
              />
            )
          })}
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
        <div className="flex gap-3 sticky bottom-4">
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
    </div>
  )
}

interface TeamSlotProps {
  index: number
  team: Team | undefined
  teams: Team[]
  selectedTlas: string[]
  onSelect: (tla: string) => void
  onClear: () => void
  disabled: boolean
  highlight?: boolean
}

function TeamSlot({ index, team, teams, selectedTlas, onSelect, onClear, disabled, highlight }: TeamSlotProps) {
  const [open, setOpen] = useState(false)

  if (team) {
    const flagUrl = getFlagUrl(team.iso2, team.tla, team.full)
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
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full p-3 rounded-lg border-2 border-dashed ${
          highlight ? 'border-accent/30' : 'border-primary/30'
        } hover:border-accent/60 transition-colors text-left ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <p className="text-xs text-text-secondary">Selección {index}</p>
        <p className="font-heading text-text-secondary">Seleccionar equipo...</p>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-surface border border-surface-light rounded-lg shadow-xl">
            {teams
              .filter((t) => !selectedTlas.includes(t.tla) || t.tla === '')
              .map((t) => {
                const flagUrl = getFlagUrl(t.iso2, t.tla, t.full)
                return (
                  <button
                    key={t.tla}
                    type="button"
                    onClick={() => {
                      onSelect(t.tla)
                      setOpen(false)
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-surface-light text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                      {flagUrl ? (
                        <img src={flagUrl} alt={t.full} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">{getFlagEmoji(t.tla)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{t.name}</p>
                      <p className="text-xs text-text-secondary font-mono">{t.tla}</p>
                    </div>
                  </button>
                )
              })}
          </div>
        </>
      )}
    </div>
  )
}
