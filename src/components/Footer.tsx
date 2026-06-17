import Link from 'next/link'
import { Trophy, Heart } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background/90 border-t border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-accent" />
              <span className="font-display text-xl text-white">
                POLLA MUNDIALISTA
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-md">
              Participa en laquiniela más emocionate del Mundial 2026. 
              Predice los resultados, acumula puntos y gana increíbles premios.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-text-primary mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ranking" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Ranking
                </Link>
              </li>
              
              <li>
                <Link href="/reglamento" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Reglamento
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-text-primary mb-4">Premios</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/premios" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Ver Premios
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-accent/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            © {currentYear} Town Center. Todos los derechos reservados.
          </p>
          <p className="text-text-secondary text-sm flex items-center gap-1">
            Hecho con <Heart className="w-4 h-4 text-accent" /> para los aficionados
          </p>
        </div>
      </div>
    </footer>
  )
}
