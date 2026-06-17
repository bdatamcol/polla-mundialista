'use client'

import { useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { loginUser } from '@/actions/auth-actions'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    setIsLoading(true)

    const result = await loginUser({ email, password })

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión')
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
            <LogIn className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl text-white mb-2">
            INICIAR <span className="text-accent">SESIÓN</span>
          </h1>
          <p className="text-text-secondary">
            ¿Ya tienes cuenta? Ingresa tus datos
          </p>
        </div>

        <Card className="glow-accent">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-error text-sm text-center bg-error/10 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" scroll className="text-accent hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
