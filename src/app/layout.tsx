import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getCurrentUser } from '@/lib/auth'

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

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
       <Navbar user={user ? { ...user, password: '', updatedAt: new Date() } : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
