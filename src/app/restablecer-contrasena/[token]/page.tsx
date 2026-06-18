import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { validateResetToken, resetPasswordWithToken } from '@/actions/password-reset-actions'
import { ResetPasswordForm } from '@/components/ResetPasswordForm'

export default async function ResetTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const validation = await validateResetToken(token)

  if (!validation.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="text-center border-error/30">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/20 mb-4">
              <Lock className="w-8 h-8 text-error" />
            </div>
            <h1 className="font-display text-2xl text-white mb-2">
              ENLACE <span className="text-error">INVÁLIDO</span>
            </h1>
            <p className="text-text-secondary mb-6">
              {validation.error || 'Este enlace no es válido o ha expirado.'}
            </p>
            <Link
              href="/restablecer-contrasena"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80"
            >
              <ArrowLeft className="w-4 h-4" />
              Solicitar uno nuevo
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const password = formData.get('password')?.toString() || ''
    const confirmPassword = formData.get('confirmPassword')?.toString() || ''

    if (password !== confirmPassword) {
      redirect(`/restablecer-contrasena/${token}?error=${encodeURIComponent('Las contraseñas no coinciden')}`)
    }

    const result = await resetPasswordWithToken(token, password)
    if (result.success) {
      redirect('/restablecer-contrasena/exito')
    } else {
      redirect(`/restablecer-contrasena/${token}?error=${encodeURIComponent(result.error || 'Error')}`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display text-3xl text-white">
            NUEVA <span className="text-accent">CONTRASEÑA</span>
          </h1>
          {validation.email && (
            <p className="text-text-secondary mt-2 text-sm">
              Cuenta: <span className="text-accent font-medium">{validation.email}</span>
            </p>
          )}
        </div>

        <Card>
          <ResetPasswordForm action={handleSubmit} />
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}