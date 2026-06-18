import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Ban, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getCurrentUser } from '@/lib/auth'
import { logoutUser } from '@/lib/auth'

export default async function CuentaDeshabilitadaPage() {
  const user = await getCurrentUser()

  // Si no hay sesión, redirigir a login
  if (!user) {
    redirect('/login')
  }

  // Si el usuario está activo, redirigir al dashboard
  if (user.isActive) {
    redirect('/dashboard')
  }

  async function handleLogout() {
    'use server'
    await logoutUser()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="text-center border-error/30">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/20 mb-6">
            <Ban className="w-10 h-10 text-error" />
          </div>

          <h1 className="font-display text-3xl text-white mb-3">
            CUENTA <span className="text-error">DESHABILITADA</span>
          </h1>

          <p className="text-text-secondary mb-6">
            Tu cuenta ha sido desactivada por un administrador y no puedes participar en la Polla
            Mundialista en este momento.
          </p>

          <div className="bg-surface-light/50 rounded-lg p-4 mb-6 text-left">
            <h2 className="font-heading text-sm font-bold text-white mb-2">
              ¿Qué puedes hacer?
            </h2>
            <ul className="space-y-1 text-text-secondary text-sm">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Contactar al administrador para más información</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Revisar tu correo por mensajes del equipo</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Esperar a que un administrador reactive tu cuenta</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <form action={handleLogout}>
              <Button type="submit" variant="outline" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </form>
            <Link
              href="https://towncenter.com"
              className="block text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Volver al sitio principal
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-text-secondary mt-6">
          Si crees que esto es un error, contacta al equipo de Town Center.
        </p>
      </div>
    </div>
  )
}