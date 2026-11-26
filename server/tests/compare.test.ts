import { describe, it, expect } from 'vitest'

interface CompareSubject {
  acronym: string
  avgSurvival: number
  avgBrainMelt: number
}

function generateVerdict(subjects: CompareSubject[]): string {
  if (subjects.length < 2) return 'Insufficient subjects for comparison.'
  const bySurvival = [...subjects].sort((a, b) => b.avgSurvival - a.avgSurvival)
  const safest = bySurvival[0]
  const hardest = bySurvival[bySurvival.length - 1]
  const diffPct = hardest.avgSurvival > 0
    ? Math.round(((safest.avgSurvival - hardest.avgSurvival) / hardest.avgSurvival) * 100)
    : 100

  return `Verdict: ${safest.acronym} offers ${diffPct}% higher survival odds than ${hardest.acronym}, but beware: ${hardest.acronym} will induce significant cognitive damage.`
}

describe('Trauma Comparison (VS Mode) Verdict Generator', () => {
  it('calculates survival delta percentage between safest and hardest subjects', () => {
    const verdict = generateVerdict([
      { acronym: 'DBMS', avgSurvival: 7, avgBrainMelt: 5 },
      { acronym: 'M3', avgSurvival: 1, avgBrainMelt: 10 },
      { acronym: 'OS', avgSurvival: 5, avgBrainMelt: 7.33 },
    ])

    expect(verdict).toBe(
      'Verdict: DBMS offers 600% higher survival odds than M3, but beware: M3 will induce significant cognitive damage.'
    )
  })

  it('handles equal survival odds gracefully', () => {
    const verdict = generateVerdict([
      { acronym: 'OS', avgSurvival: 5, avgBrainMelt: 7 },
      { acronym: 'CN', avgSurvival: 5, avgBrainMelt: 6 },
    ])

    expect(verdict).toContain('0% higher survival odds')
  })
})
