'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UserActionsProps {
  userId: string
  userName: string
  isActive: boolean
  isCurrentUser: boolean
}

export function UserActions({ userId, userName, isActive, isCurrentUser }: UserActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleActivate = async () => {
    if (!confirm(`¿Activar la cuenta de ${userName}?`)) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al activar')
        return
      }
      router.refresh()
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlock = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: false,
          blockReason: blockReason.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al bloquear')
        return
      }
      setShowModal(false)
      setBlockReason('')
      router.refresh()
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  if (isActive) {
    return (
      <>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowModal(true)}
          isLoading={isLoading}
          disabled={isCurrentUser}
          className="text-error hover:bg-error/10"
          title={isCurrentUser ? 'No puedes bloquearte a ti mismo' : 'Bloquear usuario'}
        >
          <Ban className="w-4 h-4" />
        </Button>
        {error && <p className="text-error text-xs mt-1">{error}</p>}

        {showModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative w-full max-w-md bg-surface border border-surface-light rounded-xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 p-1 hover:bg-surface-light rounded-lg"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>

              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error/20 mb-3">
                  <Ban className="w-6 h-6 text-error" />
                </div>
                <h3 className="font-display text-xl text-white">
                  BLOQUEAR A <span className="text-error">{userName}</span>
                </h3>
                <p className="text-text-secondary text-sm mt-1">
                  El usuario no podrá iniciar sesión ni hacer predicciones.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ej: Comportamiento inapropiado, solicitud del usuario..."
                  className="w-full px-3 py-2 bg-background border border-surface-light rounded-lg text-white text-sm placeholder-text-secondary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {error && (
                <div className="mb-3 text-error text-sm bg-error/10 border border-error/30 rounded p-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleBlock}
                  isLoading={isLoading}
                  className="flex-1 bg-error hover:bg-error/90"
                >
                  Bloquear
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleActivate}
        isLoading={isLoading}
        className="text-success hover:bg-success/10"
        title="Activar usuario"
      >
        <CheckCircle2 className="w-4 h-4" />
      </Button>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </>
  )
}