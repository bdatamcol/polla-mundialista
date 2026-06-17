'use client'

import { useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { registerUser } from '@/actions/auth-actions'

export default function RegistroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    const resetScroll = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    resetScroll()
    const frame = requestAnimationFrame(resetScroll)
    const timeout = window.setTimeout(resetScroll, 50)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setIsLoading(true)

    const result = await registerUser({
      name,
      email,
      password,
      termsAccepted,
    })

    if (!result.success) {
      setError(result.error || 'Error al registrar')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-background flex items-center justify-center px-4 py-10 md:py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
            <UserPlus className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl text-white mb-2">
            CREAR <span className="text-accent">CUENTA</span>
          </h1>
          <p className="text-text-secondary">
            Regístrate para participar en la Polla Mundialista
          </p>
        </div>

        <Card className="glow-accent">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3/4 -translate-y-3/4 w-5 h-5 text-text-secondary" />
                <Input
                  type="text"
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3/4 -translate-y-3/4 w-5 h-5 text-text-secondary" />
                <Input
                  type="email"
                  label="Correo electrónico"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3/4 -translate-y-3/4 w-5 h-5 text-text-secondary" />
                <Input
                  type="password"
                  label="Contraseña"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3/4 -translate-y-3/4 w-5 h-5 text-text-secondary" />
                <Input
                  type="password"
                  label="Confirmar contraseña"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password requirements */}
            <div className="text-xs text-text-secondary space-y-1">
              <p className="font-medium mb-2">La contraseña debe tener:</p>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${password.length >= 8 ? 'bg-success' : 'bg-surface-light'}`}>
                  {password.length >= 8 && <Check className="w-3 h-3 text-white" />}
                </div>
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${/[A-Z]/.test(password) ? 'bg-success' : 'bg-surface-light'}`}>
                  {/[A-Z]/.test(password) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span>Al menos una mayúscula</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${/[0-9]/.test(password) ? 'bg-success' : 'bg-surface-light'}`}>
                  {/[0-9]/.test(password) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span>Al menos un número</span>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-surface-light bg-background text-accent focus:ring-accent"
              />
              <label htmlFor="terms" className="text-sm text-text-secondary">
                Acepto los{' '}
                <Link href="/reglamento" scroll className="text-accent hover:underline">
                  términos y condiciones
                </Link>{' '}
                de la Polla Mundialista Town Center.
              </label>
            </div>

            {error && (
              <p className="text-error text-sm text-center bg-error/10 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" scroll className="text-accent hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
