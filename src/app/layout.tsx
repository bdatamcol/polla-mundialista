import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getCurrentUser, getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Polla Mundialista Town Center',
  description: 'Participa en la quiniela del Mundial 2026. Predice resultados, acumula puntos y gana increíbles premios.',
  keywords: ['quiniela', 'mundial', '2026', 'fútbol', 'predicciones', 'Town Center'],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Detectar si hay sesión pero el usuario está inactivo
  // (getCurrentUser retorna null en ese caso)
  const session = await getSession()
  if (session && !user) {
    const headerList = await headers()
    const pathname = headerList.get('x-pathname') || ''
    // No redirigir si ya estamos en páginas públicas o en cuenta-deshabilitada
    if (
      !pathname.startsWith('/cuenta-deshabilitada') &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/registro') &&
      !pathname.startsWith('/api/')
    ) {
      const inactiveUser = await prisma.user.findUnique({
        where: { id: session },
        select: { isActive: true },
      })
      if (inactiveUser && !inactiveUser.isActive) {
        redirect('/cuenta-deshabilitada')
      }
    }
  }

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
       <Navbar user={user ? { ...user, password: '', updatedAt: new Date(), finalistPoints: (user as any).finalistPoints ?? 0 } as any : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
