import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { FinalistSyncManager } from '@/components/admin/FinalistSyncManager'

export default async function FinalistasPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="font-display text-3xl md:text-4xl text-white">
              Puntos de <span className="text-accent">Finalistas</span>
            </h1>
          </div>
          <p className="text-text-secondary">
            Sincroniza los puntos de semifinalistas y finalistas con el ranking general.
          </p>
        </div>

        <FinalistSyncManager />
      </div>
    </div>
  )
}
