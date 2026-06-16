'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ConfiguracionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState({
    groupStagePoints: '5',
    quartersPoints: '10',
    finalPoints: '15',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupStagePoints: parseInt(config.groupStagePoints),
          quartersPoints: parseInt(config.quartersPoints),
          finalPoints: parseInt(config.finalPoints),
        }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center text-text-secondary hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>

        <Card>
          <h2 className="font-display text-2xl text-white mb-2">
            CONFIGURACIÓN DE <span className="text-accent">PUNTOS</span>
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Define cuántos puntos se otorgan por acertar el marcador exacto en cada fase del torneo.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="number"
                label="Fase 1: Grupos + Octavos de final"
                min={0}
                value={config.groupStagePoints}
                onChange={(e) => setConfig({ ...config, groupStagePoints: e.target.value })}
                required
              />
              <p className="text-xs text-text-secondary mt-1 ml-1">
                Puntos por acertar marcador exacto
              </p>
            </div>

            <div>
              <Input
                type="number"
                label="Fase 2: Cuartos + Semifinales"
                min={0}
                value={config.quartersPoints}
                onChange={(e) => setConfig({ ...config, quartersPoints: e.target.value })}
                required
              />
              <p className="text-xs text-text-secondary mt-1 ml-1">
                Puntos por acertar marcador exacto
              </p>
            </div>

            <div>
              <Input
                type="number"
                label="Fase 3: Final"
                min={0}
                value={config.finalPoints}
                onChange={(e) => setConfig({ ...config, finalPoints: e.target.value })}
                required
              />
              <p className="text-xs text-text-secondary mt-1 ml-1">
                Puntos por acertar marcador exacto
              </p>
            </div>

            <div className="p-4 bg-surface-light/50 rounded-lg flex gap-3">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-text-secondary text-sm">
                <p className="mb-2">
                  <strong className="text-white">Regla:</strong> Solo se otorgan puntos si aciertas
                  el marcador exacto. Si fallas, no sumas puntos.
                </p>
                <p>
                  A mayor fase, mayor la recompensa. La final vale el triple que un partido de grupos.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>

        {/* Recalculate Points */}
        <Card className="mt-6">
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
            Recalcular Puntos
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            Recalcula todos los puntos de todos los usuarios con la nueva configuración. Útil después de cambiar los valores.
          </p>
        </Card>
      </div>
    </div>
  )
}
