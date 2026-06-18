'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateMyParentesco } from '@/actions/user-actions'

const STORAGE_KEY = 'parentesco_reminder_dismissed'

export function ParentescoReminderModal({ userName }: { userName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [parentesco, setParentesco] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = sessionStorage.getItem(STORAGE_KEY)
    if (!dismissed) setOpen(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await updateMyParentesco(parentesco)
      if (!res.success) {
        setError(res.error || 'Error al guardar')
        return
      }
      sessionStorage.removeItem(STORAGE_KEY)
      setOpen(false)
      router.refresh()
    } catch {
      setError('Error de conexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, '1')
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-surface border border-accent/30 rounded-xl shadow-2xl p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 hover:bg-surface-light rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 mb-3">
            <Users className="w-7 h-7 text-accent" />
          </div>
          <h3 className="font-display text-2xl text-white">
            HOLA, <span className="text-accent">{userName.split(' ')[0]}</span>
          </h3>
          <p className="text-text-secondary text-sm mt-2">
            Para mejorar tu experiencia en la polla, necesitamos que completes un dato
            importante.
          </p>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-text-secondary">
            <strong className="text-accent">Parentesco / Relacion:</strong> es el dato que
            nos ayuda a identificar tu relacion con Town Center (Ej: Titular, Conyuge,
            Hijo, Empleado, etc).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Tu parentesco o relacion
            </label>
            <input
              type="text"
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              placeholder="Ej: Titular, Conyuge, Hijo, Empleado..."
              maxLength={80}
              className="w-full px-3 py-2.5 bg-background border border-surface-light rounded-lg text-white text-sm placeholder-text-secondary focus:outline-none focus:border-accent"
            />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg p-2 text-error text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismiss}
              disabled={isLoading}
              className="flex-1"
            >
              Mas tarde
            </Button>
            <Button
              type="submit"
              disabled={isLoading || parentesco.trim().length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar parentesco'
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-text-secondary text-center mt-4">
          Te lo volveremos a recordar en tu proximo inicio de sesion si decides
          hacerlo despues.
        </p>
      </div>
    </div>
  )
}