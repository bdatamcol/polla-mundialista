import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { requestPasswordReset } from '@/actions/password-reset-actions'

async function ForgotForm() {
  async function handleSubmit(formData: FormData) {
    'use server'
    const email = formData.get('email')?.toString() || ''
    const result = await requestPasswordReset(email)
    if (result.success) {
      if (result.token) {
        // Sin envío de email: redirigir directo al link con el token
        redirect(`/restablecer-contrasena/${result.token}`)
      } else {
        // Email no existe pero no revelamos esa info
        redirect('/restablecer-contrasena?status=ok')
      }
    } else {
      redirect(`/restablecer-contrasena?error=${encodeURIComponent(result.error || 'Error')}`)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        type="email"
        name="email"
        label="Correo electrónico"
        placeholder="tu@correo.com"
        required
        autoFocus
      />
      <Button type="submit" className="w-full">
        <Mail className="w-4 h-4 mr-2" />
        Continuar
      </Button>
    </form>
  )
}

export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
            <KeyRound className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-3xl text-white">
            RESTABLECER <span className="text-accent">CONTRASEÑA</span>
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Ingresa tu correo electrónico para continuar.
          </p>
        </div>

        <Card>
          {params.status === 'ok' && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-success font-medium">Solicitud procesada</p>
                <p className="text-text-secondary text-sm mt-1">
                  Si el correo está registrado, recibirás instrucciones para restablecer tu
                  contraseña.
                </p>
              </div>
            </div>
          )}

          {params.error && (
            <div className="bg-error/10 border border-error/30 rounded-lg p-3 mb-4 text-error text-sm">
              {decodeURIComponent(params.error)}
            </div>
          )}

          <Suspense fallback={<div className="text-text-secondary">Cargando...</div>}>
            <ForgotForm />
          </Suspense>

          <div className="mt-6 pt-4 border-t border-surface-light text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}