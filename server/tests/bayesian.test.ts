import { describe, it, expect } from 'vitest'

// Pure mathematical implementation of the IMDb Bayesian formula for verification
export function calculateBayesianRating(v: number, R: number, C: number, m = 5): number {
  if (v === 0) return 0
  const WR = (v / (v + m)) * R + (m / (v + m)) * C
  return parseFloat(WR.toFixed(2))
}

export function calculateStdDev(ratings: number[], mean: number): number {
  if (ratings.length === 0) return 0
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length
  return parseFloat(Math.sqrt(variance).toFixed(2))
}

describe('IMDb Bayesian Weighted Ranking Engine', () => {
  const globalMean = 5.5
  const minVotesThreshold = 5

  it('prevents a single 10/10 vote from dominating the Hall of Fame', () => {
    // 1 student gave 10/10. Without Bayesian, this would be #1 in the college.
    const rawRating = 10.0
    const voteCount = 1

    const weightedScore = calculateBayesianRating(voteCount, rawRating, globalMean, minVotesThreshold)
    
    // (1 / 6) * 10 + (5 / 6) * 5.5 = 1.67 + 4.58 = 6.25
    expect(weightedScore).toBe(6.25)
    expect(weightedScore).toBeLessThan(7.0) // Significantly dampened towards the global mean
  })

  it('rewards subjects with large sample sizes of high ratings', () => {
    // 50 students rated an elective 9.0/10
    const rawRating = 9.0
    const voteCount = 50

    const weightedScore = calculateBayesianRating(voteCount, rawRating, globalMean, minVotesThreshold)

    // (50 / 55) * 9.0 + (5 / 55) * 5.5 = 8.18 + 0.50 = 8.68
    expect(weightedScore).toBe(8.68)
    expect(weightedScore).toBeGreaterThan(8.5)
  })

  it('correctly weighs low-rated trauma subjects with high volume', () => {
    // 40 students suffered through M3 and rated it 2.5/10
    const rawRating = 2.5
    const voteCount = 40

    const weightedScore = calculateBayesianRating(voteCount, rawRating, globalMean, minVotesThreshold)

    // (40 / 45) * 2.5 + (5 / 45) * 5.5 = 2.22 + 0.61 = 2.83
    expect(weightedScore).toBe(2.83)
    expect(weightedScore).toBeLessThan(3.5)
  })

  it('accurately computes standard deviation for polarization metric', () => {
    // Bimodal distribution: students either gave 10 or 2 (controversial subject)
    const polarizingScores = [10, 10, 2, 2]
    const mean = 6.0
    const stddev = calculateStdDev(polarizingScores, mean)

    // sqrt(((16 + 16 + 16 + 16) / 4)) = sqrt(16) = 4.0
    expect(stddev).toBe(4.0)

    // High consensus subject: all students gave 5
    const consensusScores = [5, 5, 5, 5]
    expect(calculateStdDev(consensusScores, 5.0)).toBe(0.0)
  })
})
