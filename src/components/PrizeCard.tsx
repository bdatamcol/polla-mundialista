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

  const colors = {
    1: 'text-accent bg-accent/20',
    2: 'text-gray-400 bg-gray-400/20',
    3: 'text-amber-700 bg-amber-700/20',
  }

  const Icon = icons[prize.position as keyof typeof icons] || Award
  const colorClass = colors[prize.position as keyof typeof colors] || 'text-text-secondary bg-surface-light'

  return (
    <Card className="text-center hover:scale-[1.02] transition-all duration-200">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="w-8 h-8" />
      </div>
      
      <h3 className="font-display text-2xl font-bold text-text-primary mb-2">
        #{prize.position}
      </h3>
      
      <h4 className="font-heading text-lg font-semibold text-accent mb-3">
        {prize.title}
      </h4>
      
      <p className="text-text-secondary text-sm mb-4">
        {prize.description}
      </p>
      
      {prize.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={prize.imageUrl}
            alt={prize.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}
      
      <div className="text-xs text-text-secondary bg-surface-light/50 rounded-lg p-3">
        <p className="font-medium mb-1">Condiciones:</p>
        <p>{prize.conditions}</p>
      </div>
    </Card>
  )
}
