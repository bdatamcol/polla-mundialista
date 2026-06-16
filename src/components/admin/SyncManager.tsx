'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Download, Upload, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function SyncManager() {
  const router = useRouter()
  const [isSyncingMatches, setIsSyncingMatches] = useState(false)
  const [isSyncingResults, setIsSyncingResults] = useState(false)
  const [isCleaningTbd, setIsCleaningTbd] = useState(false)
  const [tbdCount, setTbdCount] = useState<{ tbdMatches: number; totalMatches: number } | null>(null)
  const [matchResult, setMatchResult] = useState<{ success: boolean; message: string } | null>(null)
  const [resultResult, setResultResult] = useState<{ success: boolean; message: string } | null>(null)
  const [cleanResult, setCleanResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    checkTbdCount()
  }, [])

  const checkTbdCount = async () => {
    try {
      const res = await fetch('/api/admin/cleanup-tbd')
      if (res.ok) {
        const data = await res.json()
        setTbdCount({ tbdMatches: data.tbdMatches, totalMatches: data.totalMatches })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const syncMatches = async () => {
    setIsSyncingMatches(true)
    setMatchResult(null)

    try {
      const res = await fetch('/api/sync/matches')
      const data = await res.json()

      if (res.ok) {
        setMatchResult({ success: true, message: data.message })
        checkTbdCount()
        router.refresh()
      } else {
        setMatchResult({ success: false, message: data.error || 'Error desconocido' })
      }
    } catch (error) {
      setMatchResult({ success: false, message: 'Error de conexión' })
    } finally {
      setIsSyncingMatches(false)
    }
  }

  const syncResults = async () => {
    setIsSyncingResults(true)
    setResultResult(null)

    try {
      const res = await fetch('/api/sync/results')
      const data = await res.json()

      if (res.ok) {
        setResultResult({ success: true, message: data.message })
        router.refresh()
      } else {
        setResultResult({ success: false, message: data.error || 'Error desconocido' })
      }
    } catch (error) {
      setResultResult({ success: false, message: 'Error de conexión' })
    } finally {
      setIsSyncingResults(false)
    }
  }

  const cleanupTbd = async () => {
    if (!confirm('¿Estás seguro de eliminar todos los partidos TBD? Esta acción no se puede deshacer.')) {
      return
    }

    setIsCleaningTbd(true)
    setCleanResult(null)

    try {
      const res = await fetch('/api/admin/cleanup-tbd', { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        setCleanResult({ success: true, message: data.message })
        checkTbdCount()
        router.refresh()
      } else {
        setCleanResult({ success: false, message: data.error || 'Error' })
      }
    } catch (error) {
      setCleanResult({ success: false, message: 'Error de conexión' })
    } finally {
      setIsCleaningTbd(false)
    }
  }

  return (
    <div className="space-y-6">
      {tbdCount && tbdCount.tbdMatches > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <CardTitle className="mb-1 text-warning">Partidos TBD Detectados</CardTitle>
              <p className="text-text-secondary text-sm">
                Hay {tbdCount.tbdMatches} partidos sin equipos asignados (TBD - To Be Determined).
                Esto sucede porque la API de football-data.org aún no tiene la información completa del Mundial 2026.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={cleanupTbd}
            isLoading={isCleaningTbd}
            className="border-warning/50 text-warning hover:bg-warning/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Partidos TBD
          </Button>

          {cleanResult && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                cleanResult.success
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              }`}
            >
              {cleanResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{cleanResult.message}</span>
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-accent" />
          Sincronizar Partidos
        </CardTitle>
        <p className="text-text-secondary text-sm mb-4">
          Descarga todos los partidos del Mundial 2026 desde football-data.org.
          Solo se crearán partidos con equipos ya asignados.
        </p>
        <Button onClick={syncMatches} isLoading={isSyncingMatches} disabled={isSyncingMatches}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingMatches ? 'animate-spin' : ''}`} />
          Sincronizar Partidos
        </Button>

        {matchResult && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              matchResult.success
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {matchResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{matchResult.message}</span>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-accent" />
          Actualizar Resultados
        </CardTitle>
        <p className="text-text-secondary text-sm mb-4">
          Actualiza los resultados en tiempo real desde football-data.org.
          Durante partidos en vivo, ejecuta esto cada 1-5 minutos.
        </p>
        <p className="text-warning text-xs mb-4">
          ⚠️ La API gratuita tiene límite de 10 llamadas/minuto. No ejecutes muy seguido.
        </p>
        <Button onClick={syncResults} isLoading={isSyncingResults} disabled={isSyncingResults}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingResults ? 'animate-spin' : ''}`} />
          Actualizar Resultados
        </Button>

        {resultResult && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              resultResult.success
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {resultResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{resultResult.message}</span>
          </div>
        )}
      </Card>

      <Card className="bg-surface-dark">
        <CardTitle className="mb-4">Configurar Sincronización Automática</CardTitle>
        <div className="text-text-secondary text-sm space-y-3">
          <p>
            Para sincronizar automáticamente, configura un cron job que llame a estos endpoints:
          </p>
          <div className="bg-background p-3 rounded-lg font-mono text-xs overflow-x-auto">
            <p># Sincronizar partidos (1-2 veces al día)</p>
            <p>GET https://polla.towncenter.com/api/sync/matches</p>
            <br />
            <p># Actualizar resultados (cada 5 minutos durante partidos)</p>
            <p>GET https://polla.towncenter.com/api/sync/results</p>
          </div>
          <p className="text-xs">
            <strong>Vercel:</strong> Usa Vercel Cron en vercel.json<br />
            <strong>Railway:</strong> Usa Railway Cron Jobs<br />
            <strong>Render:</strong> Usa Render Cron Jobs
          </p>
        </div>
      </Card>
    </div>
  )
}
