'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Trophy, Users, Award, BookOpen, LogOut, User, Settings } from 'lucide-react'
import { cn } from '@/components/ui/Button'
import type { User as UserType } from '@/types'

interface NavbarProps {
  user?: UserType | null
}

export function Navbar(props: NavbarProps) {
  const { user } = props
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const publicLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/ranking', label: 'Ranking' },
    { href: '/premios', label: 'Premios' },
    { href: '/reglamento', label: 'Reglamento' },
  ]

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/predicciones', label: 'Mis Predicciones' },
    { href: '/perfil', label: 'Mi Perfil' },
  ]

  const adminLinks = [{ href: '/admin', label: 'Admin' }]

  const allLinks = user
    ? [
        ...publicLinks,
        ...userLinks,
        ...(user.role === 'ADMIN' ? adminLinks : []),
      ]
    : publicLinks

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-accent/20 shadow-lg shadow-primary-dark/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-accent" />
            <span className="font-display text-xl text-white hidden sm:block">
              POLLA MUNDIALISTA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-accent text-black shadow-md shadow-accent/20'
                    : 'text-text-secondary hover:text-white hover:bg-surface-light'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{user.name}</span>
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  scroll
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-accent transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  scroll
                  className="px-4 py-2 text-sm font-medium bg-accent text-black rounded-lg hover:bg-accent-light transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-surface-light transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface-dark border-t border-surface-light animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-accent text-black shadow-md shadow-accent/20'
                    : 'text-text-secondary hover:text-white hover:bg-surface-light'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {user ? (
            <div className="px-4 py-4 border-t border-surface-light">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </form>
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-surface-light space-y-3">
              <Link
                href="/login"
                scroll
                onClick={() => setIsMenuOpen(false)}
                className="block w-full rounded-lg border border-accent/25 px-4 py-3 text-center text-sm font-medium text-text-primary hover:bg-surface-light transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                scroll
                onClick={() => setIsMenuOpen(false)}
                className="block w-full rounded-lg bg-accent px-4 py-3 text-center text-sm font-medium text-black hover:bg-accent-light transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
