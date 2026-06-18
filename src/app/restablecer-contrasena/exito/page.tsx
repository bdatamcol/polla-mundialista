import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function ResetSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="text-center border-success/30">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">
            ¡CONTRASEÑA <span className="text-success">ACTUALIZADA</span>!
          </h1>
          <p className="text-text-secondary mb-6">
            Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva
            contraseña.
          </p>
          <Link href="/login">
            <Button className="w-full">
              Iniciar sesión
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}