import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface VibeHistogramProps {
  distribution: Record<number, number>
}

export const VibeHistogram: React.FC<VibeHistogramProps> = ({ distribution = {} }) => {
  const data = Array.from({ length: 10 }, (_, i) => {
    const score = i + 1
    return {
      score: `${score}`,
      count: distribution[score] || 0,
    }
  })

  const totalVotes = Object.values(distribution).reduce((a, b) => a + b, 0)

  if (totalVotes === 0) {
    return (
      <div className="h-28 flex flex-col items-center justify-center text-xs text-[#666660] border border-dashed border-[#E6E2DA] rounded-sm bg-[#FAF8F5]/60 p-4">
        <span className="font-mono">No score ratings recorded yet.</span>
        <span className="text-[11px] mt-0.5">Be the first to record a rating for this subject.</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="score"
              tickLine={false}
              axisLine={{ stroke: '#E6E2DA' }}
              tick={{ fontSize: 10, fill: '#666660', fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 9, fill: '#666660', fontFamily: 'JetBrains Mono' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0A0A0A] text-[#FAF8F5] text-[11px] font-mono px-2 py-1 rounded shadow-md border border-neutral-700">
                      Score {payload[0].payload.score}/10: {payload[0].value} {payload[0].value === 1 ? 'vote' : 'votes'}
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.score}`}
                  fill={parseInt(entry.score) >= 8 ? '#D97706' : parseInt(entry.score) <= 3 ? '#B91C1C' : '#44403C'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center text-[10px] font-mono text-[#666660] mt-1 px-1">
        <span>1: Pure Unwatchable</span>
        <span>10: Absolute Cinema</span>
      </div>
    </div>
  )
}
