import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Trophy, Target, Calendar, TrendingUp, Settings, ChevronRight, RefreshCw } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getAdminStats } from '@/actions/admin-actions'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const admin = await isAdmin()
  if (!admin) {
    redirect('/dashboard')
  }

  const stats = await getAdminStats()

  const menuItems = [
    {
      title: 'Partidos',
      description: 'Crear, editar y eliminar partidos',
      href: '/admin/partidos',
      icon: Calendar,
      color: 'text-primary-light',
    },
    {
      title: 'Resultados',
      description: 'Cargar marcadores finales',
      href: '/admin/resultados',
      icon: Target,
      color: 'text-success',
    },
    {
      title: 'Sincronización',
      description: 'Sincronizar con API externa',
      href: '/admin/sync',
      icon: RefreshCw,
      color: 'text-accent',
    },
    {
      title: 'Predicciones',
      description: 'Ver todas las predicciones',
      href: '/admin/predicciones',
      icon: Trophy,
      color: 'text-accent',
    },
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios registrados',
      href: '/admin/usuarios',
      icon: Users,
      color: 'text-secondary-light',
    },
    {
      title: 'Premios',
      description: 'Configurar premios de la polla',
      href: '/admin/premios',
      icon: TrendingUp,
      color: 'text-warning',
    },
    {
      title: 'Configuración',
      description: 'Configurar sistema de puntos',
      href: '/admin/configuracion',
      icon: Settings,
      color: 'text-text-secondary',
    },
  ]

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            PANEL <span className="text-accent">ADMINISTRADOR</span>
          </h1>
          <p className="text-text-secondary">
            Gestiona la Polla Mundialista desde aquí.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="font-mono text-2xl font-bold text-text-primary">
              {stats?.totalUsers ?? 0}
            </p>
            <p className="text-text-secondary text-xs">Usuarios</p>
          </Card>
          <Card className="text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary-light" />
            <p className="font-mono text-2xl font-bold text-text-primary">
              {stats?.totalMatches ?? 0}
            </p>
            <p className="text-text-secondary text-xs">Partidos</p>
          </Card>
          <Card className="text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="font-mono text-2xl font-bold text-text-primary">
              {stats?.finishedMatches ?? 0}
            </p>
            <p className="text-text-secondary text-xs">Finalizados</p>
          </Card>
          <Card className="text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="font-mono text-2xl font-bold text-text-primary">
              {stats?.pendingMatches ?? 0}
            </p>
            <p className="text-text-secondary text-xs">Pendientes</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-secondary-light" />
            <p className="font-mono text-2xl font-bold text-text-primary">
              {stats?.totalPredictions ?? 0}
            </p>
            <p className="text-text-secondary text-xs">Predicciones</p>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="card-hover h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-surface-light flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="mb-1">{item.title}</CardTitle>
                      <p className="text-text-secondary text-sm">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
