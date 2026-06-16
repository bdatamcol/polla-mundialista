import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { getPrizes, deletePrize } from '@/actions/admin-actions'

export default async function AdminPremiosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!(await isAdmin())) redirect('/dashboard')

  const prizes = await getPrizes()

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl text-white">
              GESTIONAR <span className="text-accent">PREMIOS</span>
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Configura los premios para los ganadores de la polla.
            </p>
          </div>
          <Link href="/admin/premios/nuevo">
            <Button>Crear Premio</Button>
          </Link>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prizes.map((prize) => (
                <TableRow key={prize.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-accent">#{prize.position}</span>
                  </TableCell>
                  <TableCell className="font-medium">{prize.title}</TableCell>
                  <TableCell className="text-text-secondary max-w-xs truncate">
                    {prize.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={prize.isPublished ? 'success' : 'default'}>
                      {prize.isPublished ? 'Publicado' : 'Oculto'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/premios`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/premios/${prize.id}`}>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <form action={async () => {
                        'use server'
                        await deletePrize(prize.id)
                      }}>
                        <Button size="sm" variant="ghost" className="text-error hover:bg-error/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {prizes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-text-secondary">
                    No hay premios configurados aún.
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
