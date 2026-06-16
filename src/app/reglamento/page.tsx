import { BookOpen, Trophy, Calendar, Users, Star, AlertCircle } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'

export default function ReglamentoPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
            REGLAMENTO <span className="text-accent">OFICIAL</span>
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Conoce todas las reglas y condiciones para participar en la Polla Mundialista Town Center.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Cómo participar
            </h2>
            <Card>
              <ol className="space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">1</span>
                  <span>Regístrate en la plataforma con tu nombre y correo electrónico válido.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">2</span>
                  <span>Acepta los términos y condiciones de la promoción.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">3</span>
                  <span>Realiza tus predicciones para cada partido del Mundial 2026.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">4</span>
                  <span>Los puntos se calcularán automáticamente una vez cargados los resultados.</span>
                </li>
              </ol>
            </Card>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Sistema de puntos
            </h2>
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                  <div>
                    <CardTitle className="text-success">Marcador Exacto</CardTitle>
                    <p className="text-text-secondary text-sm">Adivinar el resultado exacto</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-success">150</span>
                    <p className="text-text-secondary text-xs">puntos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div>
                    <CardTitle className="text-accent">Ganador o Empate</CardTitle>
                    <p className="text-text-secondary text-sm">Adivinar quién gana o si hay empate</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-accent">90</span>
                    <p className="text-text-secondary text-xs">puntos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                  <div>
                    <CardTitle>Incorrecto</CardTitle>
                    <p className="text-text-secondary text-sm">No acertar el resultado</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-error">0</span>
                    <p className="text-text-secondary text-xs">puntos</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Fechas límite
            </h2>
            <Card>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <span className="text-accent">•</span>
                  <span>Las predicciones se pueden hacer hasta el inicio de cada partido.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">•</span>
                  <span>Una vez iniciado el partido, la predicción queda bloqueada.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">•</span>
                  <span>Los puntos se asignan automáticamente al cargar el resultado final.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">•</span>
                  <span>Puedes editar tus predicciones mientras el partido no haya iniciado.</span>
                </li>
              </ul>
            </Card>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Criterios de desempate
            </h2>
            <Card>
              <p className="text-text-secondary mb-4">
                En caso de empate en puntos, se utilizarán los siguientes criterios:
              </p>
              <ol className="space-y-2 text-text-secondary">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-light text-sm font-bold flex items-center justify-center">1</span>
                  <span>Mayor cantidad de marcadores exactos</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-light text-sm font-bold flex items-center justify-center">2</span>
                  <span>Mayor cantidad de ganadores o empates acertados</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-light text-sm font-bold flex items-center justify-center">3</span>
                  <span>Fecha de registro más antigua</span>
                </li>
              </ol>
            </Card>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Consideraciones importantes
            </h2>
            <Card>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <span className="text-warning">•</span>
                  <span>Solo se permite una predicción por partido por usuario.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-warning">•</span>
                  <span>El administrador puede descalificar predicciones sospechosas de fraude.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-warning">•</span>
                  <span>Los resultados son definitivos una vez cargados por el administrador.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-warning">•</span>
                  <span> Town Center se reserva el derecho de modificar este reglamento.</span>
                </li>
              </ul>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
