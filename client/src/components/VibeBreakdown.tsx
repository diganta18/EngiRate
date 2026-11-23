import React from 'react'

interface VibeBreakdownProps {
  overall: number
  survival: number
  brainMelt: number
  realValue: number
  compact?: boolean
}

export const VibeBreakdown: React.FC<VibeBreakdownProps> = ({
  overall,
  survival,
  brainMelt,
  realValue,
  compact = false
}) => {
  const axes = [
    {
      label: 'Overall Cinema',
      subtitle: 'General vibe & enjoyability',
      value: overall,
      color: '#D97706', // Warm Amber
      bg: 'bg-amber-500',
    },
    {
      label: 'One-Night Survival',
      subtitle: 'Opening syllabus at 11 PM odds',
      value: survival,
      color: '#15803D', // Forest Green
      bg: 'bg-emerald-600',
    },
    {
      label: 'Brain Melt Index',
      subtitle: 'Existential cognitive damage',
      value: brainMelt,
      color: '#B91C1C', // Muted Crimson
      bg: 'bg-rose-600',
    },
    {
      label: 'Real Value vs Yap',
      subtitle: 'Actual skill vs memorized filler',
      value: realValue,
      color: '#44403C', // Warm Charcoal
      bg: 'bg-stone-700',
    },
  ]

  return (
    <div className={`space-y-${compact ? '2.5' : '4'}`}>
      {axes.map((axis) => {
        const percentage = Math.min(Math.max((axis.value / 10) * 100, 4), 100)
        return (
          <div key={axis.label} className="space-y-1">
            <div className="flex justify-between items-baseline text-xs">
              <div>
                <span className="font-medium text-[#141414]">{axis.label}</span>
                {!compact && (
                  <span className="text-[#666660] text-[11px] ml-2 hidden sm:inline">
                    — {axis.subtitle}
                  </span>
                )}
              </div>
              <span className="font-mono font-semibold text-[#141414]">
                {axis.value > 0 ? axis.value.toFixed(1) : '—'}<span className="text-[#666660] text-[10px]">/10</span>
              </span>
            </div>
            
            {/* Minimalist Progress Track */}
            <div className="h-1.5 w-full bg-[#E6E2DA] rounded-full overflow-hidden">
              <div
                className={`h-full ${axis.bg} transition-all duration-500 rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
