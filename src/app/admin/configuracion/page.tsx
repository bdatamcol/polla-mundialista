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
    matchPoints: '5',
    semifinalistPoints: '10',
    finalistPoints: '20',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchPoints: parseInt(config.matchPoints),
          semifinalistPoints: parseInt(config.semifinalistPoints),
          finalistPoints: parseInt(config.finalistPoints),
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

  const handleRecalculate = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/recalculate-points', { method: 'POST' })
      if (res.ok) {
        router.refresh()
        alert('Puntos recalculados con éxito')
      } else {
        alert('Error al recalcular puntos')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
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
            Define los puntos que se otorgan por acertar en los diferentes tipos de predicción.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="number"
                label="Partidos: marcador exacto"
                min={0}
                value={config.matchPoints}
                onChange={(e) => setConfig({ ...config, matchPoints: e.target.value })}
                required
              />
              <p className="text-xs text-text-secondary mt-1 ml-1">
                Puntos por acertar el marcador exacto de un partido
              </p>
            </div>

            <div>
              <Input
                type="number"
                label="Semifinalistas: por selección correcta"
                min={0}
                value={config.semifinalistPoints}
                onChange={(e) => setConfig({ ...config, semifinalistPoints: e.target.value })}
                required
              />
              <p className="text-xs text-text-secondary mt-1 ml-1">
                Puntos por cada equipo que aciertes en semifinales (4 selecciones)
              </p>
            </div>

            <div>
              <Input
                type="number"
                label="Finalistas: por selección correcta"
                min={0}
                value={config.finalistPoints}
                onChange={(e) => setConfig({ ...config, finalistPoints: e.target.value })}
                required
              />
              <p className="text-xs text-text-secondary mt-1 ml-1">
                Puntos por cada equipo que aciertes en la final (2 selecciones)
              </p>
            </div>

            <div className="p-4 bg-surface-light/50 rounded-lg flex gap-3">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-text-secondary text-sm">
                <p className="mb-2">
                  <strong className="text-white">Reglas:</strong> Solo se otorgan puntos si aciertas
                  el marcador EXACTO de un partido. Para finalistas, sumas puntos por cada equipo
                  correctamente seleccionado.
                </p>
                <p>
                  Máximo posible: 104 partidos × 5 pts + 40 pts semis + 40 pts final = 600 pts
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
            Recalcula todos los puntos de partidos y finalistas con la nueva configuración. Útil después de cambiar los valores.
          </p>
          <Button variant="outline" type="button" onClick={handleRecalculate} isLoading={isLoading}>
            Recalcular Todos los Puntos
          </Button>
        </Card>
      </div>
    </div>
  )
}
