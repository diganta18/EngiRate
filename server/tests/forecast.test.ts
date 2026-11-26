import { describe, it, expect } from 'vitest'

// Pure forecast classification logic tester
function determineForecastMeta(avgSurvival: number, avgBrainMelt: number, electiveRatio: number, hasHardcoreMath: boolean) {
  if (avgSurvival >= 6.8 && avgBrainMelt <= 4.2) {
    return { title: 'THE CHILL BEFORE THE STORM', genre: 'Slice of Life / Comfort Cinema', censor: 'U' }
  } else if (avgSurvival <= 4.0 && avgBrainMelt >= 6.5) {
    return { title: 'REQUIEM FOR A GPA', genre: 'Psychological Horror', censor: 'NC-17' }
  } else if (electiveRatio >= 0.5) {
    return { title: "DIRECTOR'S CHOICE: THE INDIE SEMESTER", genre: 'Indie Gem / Experimental', censor: 'PG-13' }
  } else if (hasHardcoreMath) {
    return { title: 'PROOF BY EXHAUSTION', genre: 'Mathematical Thriller', censor: 'R' }
  }
  return { title: 'MIDSEM RUNNERS: DEADLINE EDITION', genre: 'Survival Thriller', censor: 'PG-13' }
}

describe('Semester Survival Forecast Classifier', () => {
  it('correctly tags a chill semester as Slice of Life (U)', () => {
    const meta = determineForecastMeta(7.8, 3.2, 0.2, false)
    expect(meta.title).toBe('THE CHILL BEFORE THE STORM')
    expect(meta.genre).toBe('Slice of Life / Comfort Cinema')
    expect(meta.censor).toBe('U')
  })

  it('correctly identifies a nightmare semester as Psychological Horror (NC-17)', () => {
    const meta = determineForecastMeta(2.8, 8.5, 0.0, true)
    expect(meta.title).toBe('REQUIEM FOR A GPA')
    expect(meta.genre).toBe('Psychological Horror')
    expect(meta.censor).toBe('NC-17')
  })

  it('flags elective-heavy curriculum as Indie Gem', () => {
    const meta = determineForecastMeta(6.0, 5.0, 0.6, false)
    expect(meta.title).toBe("DIRECTOR'S CHOICE: THE INDIE SEMESTER")
  })

  it('recognizes heavy mathematics load as Mathematical Thriller', () => {
    const meta = determineForecastMeta(5.5, 6.0, 0.1, true)
    expect(meta.title).toBe('PROOF BY EXHAUSTION')
    expect(meta.genre).toBe('Mathematical Thriller')
  })
})
