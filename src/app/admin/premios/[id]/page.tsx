import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getPrizeById } from '@/actions/admin-actions'
import { PrizeEditForm } from '@/components/admin/PrizeEditForm'

export default async function EditarPremioPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  const prize = await getPrizeById(params.id)

  if (!prize) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-lg mx-auto px-4">
          <Link
            href="/admin/premios"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Premios
          </Link>
          <Card>
            <p className="text-text-secondary text-center py-8">Premio no encontrado.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/premios"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Premios
        </Link>

        <Card>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-2xl text-white">
              EDITAR <span className="text-accent">PREMIO</span>
            </h2>
            <Badge variant={prize.isPublished ? 'success' : 'default'} className="ml-auto">
              {prize.isPublished ? 'Publicado' : 'Oculto'}
            </Badge>
          </div>

          <PrizeEditForm
            prize={{
              id: prize.id,
              position: prize.position,
              title: prize.title,
              description: prize.description,
              imageUrl: prize.imageUrl,
              conditions: prize.conditions,
              isPublished: prize.isPublished,
            }}
          />
        </Card>
      </div>
    </div>
  )
}