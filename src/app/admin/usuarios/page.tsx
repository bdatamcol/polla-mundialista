import { redirect } from 'next/navigation'
import { Users as UsersIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getAllUsers } from '@/actions/admin-actions'
import { formatDate } from '@/lib/utils'
import { UserActions } from '@/components/admin/UserActions'

export default async function AdminUsuariosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  const users = await getAllUsers()
  const activeCount = users.filter((u) => u.isActive).length
  const blockedCount = users.filter((u) => !u.isActive).length

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white">
              GESTIONAR <span className="text-accent">USUARIOS</span>
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {users.length} usuarios · {activeCount} activos · {blockedCount} bloqueados
            </p>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Pred.</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className={!u.isActive ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-text-secondary">{u.email}</TableCell>
                  <TableCell className="text-text-secondary font-mono text-xs">{u.cedula}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'ADMIN' ? 'gold' : 'default'}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge variant="success">Activo</Badge>
                    ) : (
                      <div className="space-y-1">
                        <Badge variant="error">Bloqueado</Badge>
                        {u.blockReason && (
                          <p className="text-xs text-text-secondary italic max-w-xs truncate">
                            {u.blockReason}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-accent">{u.totalPoints}</span>
                  </TableCell>
                  <TableCell>{u._count.predictions}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell>
                    <UserActions
                      userId={u.id}
                      userName={u.name}
                      isActive={u.isActive}
                      isCurrentUser={u.id === user.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-text-secondary">
                    No hay usuarios registrados aún.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}