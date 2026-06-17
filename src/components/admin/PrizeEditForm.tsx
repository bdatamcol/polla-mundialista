'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'

interface PrizeEditFormProps {
  prize: {
    id: string
    position: number
    title: string
    description: string
    imageUrl: string | null
    conditions: string
    isPublished: boolean
  }
}

export function PrizeEditForm({ prize }: PrizeEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    position: String(prize.position),
    title: prize.title,
    description: prize.description,
    imageUrl: prize.imageUrl || '',
    conditions: prize.conditions,
    isPublished: prize.isPublished,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const payload = {
        position: parseInt(formData.position, 10),
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() ? formData.imageUrl.trim() : null,
        conditions: formData.conditions.trim(),
        isPublished: formData.isPublished,
      }

      const res = await fetch(`/api/admin/premios/${prize.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/premios')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Error al actualizar el premio')
      }
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este premio? Esta acción no se puede deshacer.')) {
      return
    }
    setIsDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/premios/${prize.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/admin/premios')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Error al eliminar')
      }
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3 text-error text-sm">
          {error}
        </div>
      )}

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
        placeholder="Ej: Televisor 50 pulgadas"
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
        placeholder="Ej: Haber completado todas las predicciones"
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
          Publicar (visible para usuarios)
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-surface-light">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Guardar Cambios
        </Button>
      </div>

      <div className="pt-4 border-t border-surface-light">
        <Button
          type="button"
          variant="ghost"
          onClick={handleDelete}
          isLoading={isDeleting}
          className="w-full text-error hover:bg-error/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar Premio
        </Button>
      </div>
    </form>
  )
}