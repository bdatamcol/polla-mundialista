import { redirect } from 'next/navigation'
import { Users as UsersIcon } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getAllUsers } from '@/actions/admin-actions'
import { formatDate } from '@/lib/utils'

export default async function AdminUsuariosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  const users = await getAllUsers()

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl text-white">
            GESTIONAR <span className="text-accent">USUARIOS</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {users.length} usuarios registrados en total
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Puntos</TableHead>
                <TableHead>Predicciones</TableHead>
                <TableHead>Fecha Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-text-secondary">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'ADMIN' ? 'gold' : 'default'}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-accent">{u.totalPoints}</span>
                  </TableCell>
                  <TableCell>{u._count.predictions}</TableCell>
                  <TableCell className="text-text-secondary whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
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
