import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

// POST /api/forecast - Generate Semester Survival Forecast & Cinema Poster
router.post('/', async (req, res) => {
  const ForecastSchema = z.object({
    subjectIds: z.array(z.number()).min(2, 'Select at least 2 subjects').max(8, 'Maximum 8 subjects allowed'),
  })

  const parsed = ForecastSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const { subjectIds } = parsed.data

  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds },
      status: 'approved',
    },
  })

  if (subjects.length < 2) {
    return res.status(400).json({ error: 'Could not find sufficient approved subjects' })
  }

  const N = subjects.length
  const avgSurvival = parseFloat((subjects.reduce((sum, s) => sum + s.avgSurvival, 0) / N).toFixed(2))
  const avgBrainMelt = parseFloat((subjects.reduce((sum, s) => sum + s.avgBrainMelt, 0) / N).toFixed(2))
  const avgOverall = parseFloat((subjects.reduce((sum, s) => sum + s.avgOverall, 0) / N).toFixed(2))
  const avgRealValue = parseFloat((subjects.reduce((sum, s) => sum + s.avgValue, 0) / N).toFixed(2))

  // Survival Index composite (1.0 to 10.0 scale)
  const survivalIndex = Math.max(1, Math.min(10, parseFloat(
    ((avgSurvival * 0.45) + ((10 - avgBrainMelt) * 0.35) + (avgRealValue * 0.20)).toFixed(1)
  )))

  // Identify Highest Risk Subject
  // Sort by lowest survival first, then highest brain melt
  const sortedByRisk = [...subjects].sort((a, b) => {
    const riskA = a.avgBrainMelt - a.avgSurvival
    const riskB = b.avgBrainMelt - b.avgSurvival
    return riskB - riskA
  })
  const highestRisk = sortedByRisk[0]

  // Calculate Variance across survival scores
  const survivalVariance = Math.sqrt(
    subjects.reduce((sum, s) => sum + Math.pow(s.avgSurvival - avgSurvival, 2), 0) / N
  )

  // Ratio of electives
  const electiveCount = subjects.filter(s => s.subjectType === 'Elective').length
  const electiveRatio = electiveCount / N

  // Check for hardcore theoretical / math subjects
  const hasHardcoreMath = subjects.some(s => 
    ['M3', 'M1', 'M2', 'FLAT', 'TOC', 'CD', 'EMFT', 'S&S', 'DM'].includes(s.acronym)
  )

  // Title, Genre, Censor & Tagline Determination
  let title = 'MIDSEM RUNNERS: DEADLINE EDITION'
  let genre = 'Survival Thriller'
  let tagline = 'One night to study. Six modules to cover. Zero regrets until 8:30 AM.'
  let censorRating = 'PG-13'

  if (avgSurvival >= 6.8 && avgBrainMelt <= 4.2) {
    title = 'THE CHILL BEFORE THE STORM'
    genre = 'Slice of Life / Comfort Cinema'
    tagline = 'An unexpectedly tranquil semester. Almost suspiciously quiet.'
    censorRating = 'U'
  } else if (avgSurvival <= 4.0 && avgBrainMelt >= 6.5) {
    title = 'REQUIEM FOR A GPA'
    genre = 'Psychological Horror'
    tagline = 'There is no curve. There is only the syllabus.'
    censorRating = 'NC-17'
  } else if (electiveRatio >= 0.5) {
    title = "DIRECTOR'S CHOICE: THE INDIE SEMESTER"
    genre = 'Indie Gem / Experimental'
    tagline = 'Curated electives, minimal lab manuals, and maximum aesthetic value.'
    censorRating = 'PG-13'
  } else if (survivalVariance >= 2.2) {
    title = 'ENSEMBLE CAST: A SEMESTER ANTHOLOGY'
    genre = 'Drama / Multi-Plot Chaos'
    tagline = 'One class will save your GPA. Three others will actively conspire against it.'
    censorRating = 'R'
  } else if (hasHardcoreMath) {
    title = 'PROOF BY EXHAUSTION'
    genre = 'Mathematical Thriller'
    tagline = 'Assume GPA > 8.0 for contradiction.'
    censorRating = 'R'
  }

  // Estimated Sleep Hours
  const predictedSleepHours = Math.max(2.5, Math.min(8.0, parseFloat((9.5 - avgBrainMelt * 0.7).toFixed(1))))

  // Satirical Survival Gear Checklist
  const gear = [
    'fx-991ES Plus Calculator (with unverified solar cell)',
    avgBrainMelt >= 5.5 ? '2.5L Cold Brew Coffee & 3 AM Instant Noodles' : 'A mildly confident sense of punctuality',
    hasHardcoreMath ? 'Emergency 2-Page Formula Sheet with microscopic handwriting' : 'Highlighter pens in 4 neon panic shades',
    'Acoustic earplugs for 8:30 AM mandatory roll-calls',
  ]

  res.json({
    forecast: {
      title,
      genre,
      tagline,
      censorRating,
      survivalIndex,
      avgSurvival,
      avgBrainMelt,
      avgOverall,
      avgRealValue,
      predictedSleepHours,
      highestRiskSubject: {
        id: highestRisk.id,
        acronym: highestRisk.acronym,
        title: highestRisk.title,
        slug: highestRisk.slug,
        avgSurvival: highestRisk.avgSurvival,
        avgBrainMelt: highestRisk.avgBrainMelt,
        censorRating: highestRisk.censorRating,
      },
      survivalGear: gear,
      subjects: subjects.map(s => ({
        id: s.id,
        slug: s.slug,
        acronym: s.acronym,
        title: s.title,
        censorRating: s.censorRating,
        avgSurvival: s.avgSurvival,
        avgBrainMelt: s.avgBrainMelt,
        weightedScore: s.weightedScore,
      })),
    }
  })
})

export default router
