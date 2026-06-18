import Link from 'next/link'
import { BookOpen, Trophy, Calendar, Users, Star, AlertCircle, Target, Award, Medal } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getPrizes } from '@/actions/admin-actions'

export default async function ReglamentoPage() {
  const prizes = await getPrizes()
  const publishedPrizes = prizes.filter((p) => p.isPublished).sort((a, b) => a.position - b.position)

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
            Conoce todas las reglas, el sistema de puntos y los premios para participar en la Polla
            Mundialista TownCenter.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Cómo participar */}
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
                  <span>
                    Realiza tus predicciones para cada partido del Mundial 2026 (fase de grupos y eliminatorias).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">4</span>
                  <span>
                    Predice los <strong className="text-white">4 semifinalistas</strong> y los{' '}
                    <strong className="text-white">2 finalistas</strong> antes de que comience la primera
                    eliminatoria.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">5</span>
                  <span>Los puntos se calcularán automáticamente una vez cargados los resultados.</span>
                </li>
              </ol>
            </Card>
          </section>

          {/* Section 2: Participación familiar */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Participación familiar
            </h2>
            <Card>
              <p className="text-text-secondary mb-4">
                Tu familia también puede participar de esta actividad, pero solo bajo las siguientes condiciones:
              </p>
              <ol className="space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">1</span>
                  <span>Cónyuge, padres, hermanos e hijos.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">2</span>
                  <span>Demostrar parentesco para reclamar el obsequio. En caso de resultar ganador.</span>
                  
                </li>
              </ol>
              <li className="flex gap-3 mt-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">3</span>
                <span>
                  Ningún otro familiar que <strong className="text-white">NO</strong> se encuentre en esta lista será excluido de la actividad y no tendrá derecho a premio.
                </span>
              </li>
            </Card>
          </section>

          {/* Section 3: Sistema de puntos */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Sistema de puntos
            </h2>

            {/* Subtítulo: partidos */}
            <h3 className="font-heading text-lg text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-success" />
              Por cada partido
            </h3>
            <Card className="mb-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                  <div>
                    <CardTitle className="text-success">Marcador Exacto</CardTitle>
                    <p className="text-text-secondary text-sm">
                      Adivinar el resultado exacto del partido (válido para fase de grupos y eliminatorias)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-3xl font-bold text-success">5</span>
                    <p className="text-text-secondary text-xs">puntos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                  <div>
                    <CardTitle>Incorrecto</CardTitle>
                    <p className="text-text-secondary text-sm">No acertar el marcador exacto</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-3xl font-bold text-error">0</span>
                    <p className="text-text-secondary text-xs">puntos</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Subtítulo: finalistas */}
            <h3 className="font-heading text-lg text-white mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Predicción de finalistas
            </h3>
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary-light/15 rounded-lg border border-primary-light/35">
                  <div>
                    <CardTitle className="text-white">Semifinalista correcto</CardTitle>
                    <p className="text-text-secondary text-sm">
                      Por cada uno de los 4 equipos que aciertes que llega a semifinales
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-3xl font-bold text-white">10</span>
                    <p className="text-text-secondary text-xs">pts c/u</p>
                    <p className="text-xs text-text-secondary mt-1">Máx. 40 pts</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/30">
                  <div>
                    <CardTitle className="text-accent">Finalista correcto</CardTitle>
                    <p className="text-text-secondary text-sm">
                      Por cada uno de los 2 equipos que aciertes que llega a la gran final
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-3xl font-bold text-accent">20</span>
                    <p className="text-text-secondary text-xs">pts c/u</p>
                    <p className="text-xs text-text-secondary mt-1">Máx. 40 pts</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 4: Premios */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Premios
            </h2>

            {publishedPrizes.length > 0 ? (
              <div className="space-y-3">
                {publishedPrizes.map((prize) => {
                  const isTop3 = prize.position <= 3
                  const positionColors = {
                    1: 'border-yellow-400/40 bg-yellow-500/10',
                    2: 'border-slate-300/40 bg-slate-400/10',
                    3: 'border-amber-600/40 bg-amber-700/10',
                  }
                  const positionIcons = {
                    1: '🥇',
                    2: '🥈',
                    3: '🥉',
                  }
                  const colorClass =
                    positionColors[prize.position as 1 | 2 | 3] || 'border-surface-light bg-surface-light/30'

                  return (
                    <Card key={prize.id} className={colorClass}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-3xl flex-shrink-0">
                            {positionIcons[prize.position as 1 | 2 | 3] || `#${prize.position}`}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-white">
                              {prize.position}° Lugar — {prize.title}
                            </CardTitle>
                            <p className="text-text-secondary text-sm mt-1">{prize.description}</p>
                            {prize.conditions && (
                              <p className="text-text-secondary text-xs mt-1 italic">
                                Condición: {prize.conditions}
                              </p>
                            )}
                          </div>
                        </div>
                        {isTop3 && (
                          <Medal className="w-6 h-6 text-accent flex-shrink-0" />
                        )}
                      </div>
                    </Card>
                  )
                })}
                <div className="text-center pt-2">
                  <Link href="/premios">
                    <Button variant="outline">Ver todos los premios</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Card>
                <p className="text-text-secondary text-center py-4">
                  Los premios serán anunciados próximamente. ¡Mantente atento a las novedades!
                </p>
              </Card>
            )}
          </section>

          {/* Section 5: Fechas límite */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Fechas límite
            </h2>
            <Card>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <span className="text-accent">•</span>
                  <span>Las predicciones de partidos se pueden hacer hasta el inicio de cada partido.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">•</span>
                  <span>Una vez iniciado el partido, la predicción queda bloqueada.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">•</span>
                  <span>
                    Las predicciones de <strong className="text-white">semifinalistas y finalistas</strong>{' '}
                    se cierran al comenzar el primer partido de Octavos de Final.
                  </span>
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

          {/* Section 6: Criterios de desempate */}
          <section>
            <h2 className="font-display text-2xl text-accent mb-4 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Criterios de desempate
            </h2>
            <Card>
              <p className="text-text-secondary mb-4">
                En caso de empate en puntos, se utilizarán los siguientes criterios en orden:
              </p>
              <ol className="space-y-2 text-text-secondary">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-light text-sm font-bold flex items-center justify-center">1</span>
                  <span>Mayor cantidad de finalistas acertados (20 pts c/u)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-light text-sm font-bold flex items-center justify-center">2</span>
                  <span>Mayor cantidad de semifinalistas acertados (10 pts c/u)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-light text-sm font-bold flex items-center justify-center">3</span>
                  <span>Mayor cantidad de marcadores exactos acertados (5 pts c/u)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-light text-sm font-bold flex items-center justify-center">4</span>
                  <span>Fecha de registro más antigua</span>
                </li>
              </ol>
            </Card>
          </section>

          {/* Section 7: Consideraciones */}
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
                  <span>Solo se permite una predicción de finalistas por usuario (editable hasta el cierre).</span>
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
                  <span>Los finalistas elegidos deben estar entre los 4 semifinalistas seleccionados.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-warning">•</span>
                  <span>TownCenter se reserva el derecho de modificar este reglamento.</span>
                </li>
              </ul>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
