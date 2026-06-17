import { Award } from 'lucide-react'
import { PrizeCard } from '@/components/PrizeCard'
import { getPrizes } from '@/actions/admin-actions'

export default async function PremiosPage() {
  const prizes = await getPrizes()

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
            <Award className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            PREMIOS <span className="text-accent">increíbles</span>
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Los mejores se llevarán estos fantásticos premios.
          </p>
        </div>

        {/* Prizes Grid */}
        {prizes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prizes.map((prize) => (
              <PrizeCard key={prize.id} prize={prize} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
              <Award className="w-12 h-12 text-text-secondary" />
            </div>
            <h2 className="font-heading text-xl text-text-primary mb-2">
              Premios por confirmar
            </h2>
            <p className="text-text-secondary">
              Los premios serán anunciados pronto. ¡Mantente atento!
            </p>
          </div>
        )}

        {/* Conditions Note */}
        <div className="mt-12 p-6 bg-surface rounded-xl border border-surface-light">
          <h3 className="font-heading text-lg font-semibold text-text-primary mb-3">
            Condiciones de los premios
          </h3>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li>• Los premios están sujetos a disponibilidad</li>
            <li>• El participante debe haber completado todas las predicciones</li>
            <li>• En caso de empate, se considera la fecha de registro más antigua</li>
            <li>• Los premios son personales y no transferibles</li>
            <li>• Town Center se reserva el derecho de modificar los premios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
