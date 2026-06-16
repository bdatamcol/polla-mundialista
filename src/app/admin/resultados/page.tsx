import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getMatches } from '@/actions/match-actions'
import { ResultadosClient } from '@/components/admin/ResultadosClient'

export default async function AdminResultadosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  const matches = await getMatches()

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ResultadosClient matches={matches} />
      </div>
    </div>
  )
}
