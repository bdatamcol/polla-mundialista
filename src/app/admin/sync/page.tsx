import { redirect } from 'next/navigation'
import { SyncManager } from '@/components/admin/SyncManager'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export default async function SyncPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            <span className="text-accent">SINCRONIZACIÓN</span> EXTERNA
          </h1>
          <p className="text-text-secondary">
            Sincroniza partidos y resultados desde football-data.org
          </p>
        </div>

        <SyncManager />
      </div>
    </div>
  )
}
