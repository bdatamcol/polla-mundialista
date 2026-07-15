'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { syncFinalistPointsToTotal } from '@/actions/admin-actions'

export function FinalistSyncManager() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: Array<{
      name: string
      matchPoints: number
      finalistPoints: number
      oldTotal: number
      newTotal: number
    }>
  } | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const res = await syncFinalistPointsToTotal()
      setResult(res)
      if (res.success) {
        router.refresh()
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión al sincronizar',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <CardTitle className="mb-1">Sincronizar Puntos de Finalistas</CardTitle>
            <p className="text-text-secondary text-sm">
              Suma los puntos de semifinalistas y finalistas al ranking general de cada usuario.
            </p>
          </div>
        </div>

        <div className="bg-surface-light rounded-lg p-4 mb-4 text-sm text-text-secondary">
          <p className="mb-2">
            <strong className="text-white">¿Cuándo usar este botón?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Después de que se jueguen partidos de cuartos, semis o final.</li>
            <li>Si notas que el ranking general no refleja los puntos de finalistas.</li>
            <li>Es seguro ejecutarlo varias veces (no duplica puntos).</li>
          </ul>
        </div>

        <Button
          onClick={handleSync}
          isLoading={isLoading}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              Sincronizar Puntos de Finalistas
            </>
          )}
        </Button>
      </Card>

      {result && (
        <Card className={result.success ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-heading font-bold ${
                  result.success ? 'text-success' : 'text-error'
                }`}
              >
                {result.message}
              </p>

              {result.success && result.details && result.details.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-secondary border-b border-surface-light">
                        <th className="text-left py-2 px-2">Usuario</th>
                        <th className="text-right py-2 px-2">Partidos</th>
                        <th className="text-right py-2 px-2">Finalistas</th>
                        <th className="text-right py-2 px-2">Antes</th>
                        <th className="text-right py-2 px-2">Ahora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.details.map((d) => (
                        <tr key={d.userId} className="border-b border-surface-light/50">
                          <td className="py-2 px-2 text-white">{d.name}</td>
                          <td className="text-right py-2 px-2 font-mono">{d.matchPoints}</td>
                          <td className="text-right py-2 px-2 font-mono text-accent">
                            +{d.finalistPoints}
                          </td>
                          <td className="text-right py-2 px-2 font-mono text-text-secondary">
                            {d.oldTotal}
                          </td>
                          <td className="text-right py-2 px-2 font-mono font-bold text-success">
                            {d.newTotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
