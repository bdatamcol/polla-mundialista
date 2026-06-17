import { Card } from '@/components/ui/Card'
import { Trophy, Medal, Award } from 'lucide-react'
import type { Prize } from '@/types'

interface PrizeCardProps {
  prize: Prize
}

export function PrizeCard({ prize }: PrizeCardProps) {
  const icons = {
    1: Trophy,
    2: Medal,
    3: Award,
  }

  const styles = {
    1: {
      icon: 'text-accent bg-accent/18',
      card: 'border-accent/40 bg-gradient-to-br from-accent/12 via-primary-light/18 to-surface-dark/95 shadow-[0_20px_60px_rgba(255,255,0,0.10)]',
      badge: 'text-accent border-accent/30 bg-accent/10',
      accent: 'from-accent via-accent/70 to-transparent',
    },
    2: {
      icon: 'text-slate-200 bg-slate-200/12',
      card: 'border-slate-300/20 bg-gradient-to-br from-slate-200/8 via-primary-light/16 to-surface-dark/95 shadow-[0_20px_60px_rgba(200,210,255,0.08)]',
      badge: 'text-slate-200 border-slate-300/20 bg-slate-200/10',
      accent: 'from-slate-200 via-slate-200/60 to-transparent',
    },
    3: {
      icon: 'text-amber-300 bg-amber-300/12',
      card: 'border-amber-300/25 bg-gradient-to-br from-amber-300/10 via-primary-light/16 to-surface-dark/95 shadow-[0_20px_60px_rgba(255,196,87,0.08)]',
      badge: 'text-amber-300 border-amber-300/20 bg-amber-300/10',
      accent: 'from-amber-300 via-amber-300/60 to-transparent',
    },
  }

  const Icon = icons[prize.position as keyof typeof icons] || Award
  const style = styles[prize.position as keyof typeof styles] || {
    icon: 'text-text-primary bg-white/10',
    card: 'border-white/10 bg-gradient-to-br from-primary-light/12 via-surface/70 to-surface-dark/95 shadow-[0_20px_60px_rgba(1,9,53,0.25)]',
    badge: 'text-text-secondary border-white/10 bg-white/5',
    accent: 'from-accent/60 via-accent/30 to-transparent',
  }

  return (
    <Card className={`group relative overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] ${style.card}`}>
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.accent}`} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-8 top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -left-8 bottom-8 h-24 w-24 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${style.badge}`}>
            {prize.position === 1 ? 'Primer Lugar' : prize.position === 2 ? 'Segundo Lugar' : prize.position === 3 ? 'Tercer Lugar' : `Puesto ${prize.position}`}
          </div>
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 ${style.icon}`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>

        <h4 className="mb-3 font-heading text-xl font-semibold leading-tight text-accent">
          {prize.title}
        </h4>

        <p className="mb-5 text-sm leading-relaxed text-text-secondary">
          {prize.description}
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary">
            Premio Oficial
          </span>
        </div>

      {prize.imageUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <img
            src={prize.imageUrl}
            alt={prize.title}
            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/70 via-transparent to-transparent" />
        </div>
      )}
      </div>
    </Card>
  )
}
