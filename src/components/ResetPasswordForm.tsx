'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ResetPasswordFormProps {
  action: (formData: FormData) => void
}

export function ResetPasswordForm({ action }: ResetPasswordFormProps) {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Indicadores de fortaleza
  const hasLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const requirements = [
    { label: 'Mínimo 8 caracteres', met: hasLength },
    { label: 'Al menos una mayúscula', met: hasUpper },
    { label: 'Al menos un número', met: hasNumber },
    { label: 'Las contraseñas coinciden', met: passwordsMatch },
  ]

  return (
    <>
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3 mb-4 text-error text-sm">
          {error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-9 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Nueva contraseña
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full pl-10 pr-12 py-2.5 bg-background border border-surface-light rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 -translate-y-1/2 text-text-secondary hover:text-white"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-9 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Confirmar contraseña
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-surface-light rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-accent"
          />
        </div>

        {password.length > 0 && (
          <div className="space-y-1 bg-surface-light/30 rounded-lg p-3">
            <p className="text-xs font-medium text-text-secondary mb-2">Requisitos:</p>
            {requirements.map((req) => (
              <div key={req.label} className="flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    req.met ? 'text-success' : 'text-text-secondary/40'
                  }`}
                />
                <span className={req.met ? 'text-success' : 'text-text-secondary/60'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!hasLength || !hasUpper || !hasNumber || !passwordsMatch}
        >
          Actualizar contraseña
        </Button>
      </form>
    </>
  )
}