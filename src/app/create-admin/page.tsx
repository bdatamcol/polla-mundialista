'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function CreateAdminPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear admin')
        return
      }

      setSuccess(true)
      
      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl text-white mb-2">
            CREAR <span className="text-accent">ADMIN</span>
          </h1>
          <p className="text-text-secondary">
            Crea tu cuenta de administrador para gestionar la polla
          </p>
        </div>

        <Card className="glow-accent">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <Input
                type="text"
                label="Nombre completo"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <Input
                type="email"
                label="Correo electrónico"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <Input
                type="password"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <Input
                type="password"
                label="Confirmar contraseña"
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="pl-10"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">¡Admin creado! Redirigiendo...</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={success}>
              Crear Cuenta Admin
            </Button>
          </form>
        </Card>

        <p className="text-center text-text-secondary text-sm mt-6">
          ¿Ya tienes cuenta admin?{' '}
          <a href="/login" className="text-accent hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}
