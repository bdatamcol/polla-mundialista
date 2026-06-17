'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function NuevoPremioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    position: '',
    title: '',
    description: '',
    imageUrl: '',
    conditions: '',
    isPublished: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Construir payload con tipos correctos para Zod
      const payload = {
        position: parseInt(formData.position, 10),
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() ? formData.imageUrl.trim() : null,
        conditions: formData.conditions.trim(),
        isPublished: formData.isPublished,
      }

      const res = await fetch('/api/admin/premios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/premios')
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Error al crear el premio')
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
        <Link
          href="/admin/premios"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Premios
        </Link>

        <Card>
          <h2 className="font-display text-2xl text-white mb-6">
            NUEVO <span className="text-accent">PREMIO</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              label="Posición"
              min={1}
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />

            <Input
              label="Título del Premio"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Primer Lugar - Premio Especial"
              required
            />

            <Textarea
              label="Descripción"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el premio..."
              required
            />

            <Input
              type="url"
              label="URL de Imagen (opcional)"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
            />

            <Textarea
              label="Condiciones"
              rows={2}
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              placeholder="Ej: Debe completar todas las predicciones"
              required
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded border-surface-light bg-background text-accent focus:ring-accent"
              />
              <label htmlFor="isPublished" className="text-sm text-text-secondary">
                Publicar inmediatamente
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Crear Premio
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
