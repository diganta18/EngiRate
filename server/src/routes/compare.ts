import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req, res) => {
  const slugsParam = req.query.slugs as string
  if (!slugsParam) {
    return res.status(400).json({ error: 'Provide at least 2 subject slugs in ?slugs=os,dbms' })
  }

  const slugs = slugsParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  if (slugs.length < 2 || slugs.length > 4) {
    return res.status(400).json({ error: 'Comparison requires between 2 and 4 subjects' })
  }

  const subjects = await prisma.subject.findMany({
    where: { slug: { in: slugs } }
  })

  if (subjects.length < 2) {
    return res.status(404).json({ error: 'Could not find sufficient subjects to compare' })
  }

  // Generate Radar Chart Data
  const radarData = [
    {
      metric: 'Overall Cinema',
      ...Object.fromEntries(subjects.map(s => [s.slug, s.avgOverall || 5]))
    },
    {
      metric: 'One-Night Survival',
      ...Object.fromEntries(subjects.map(s => [s.slug, s.avgSurvival || 5]))
    },
    {
      metric: 'Brain Melt Index',
      ...Object.fromEntries(subjects.map(s => [s.slug, s.avgBrainMelt || 5]))
    },
    {
      metric: 'Real Value',
      ...Object.fromEntries(subjects.map(s => [s.slug, s.avgValue || 5]))
    },
  ]

  // Auto-generate deadpan verdict banner
  let verdict = ''
  // Sort by survival
  const sortedBySurvival = [...subjects].sort((a, b) => (b.avgSurvival || 0) - (a.avgSurvival || 0))
  const bestSurvivor = sortedBySurvival[0]
  const worstSurvivor = sortedBySurvival[sortedBySurvival.length - 1]

  const sortedByMelt = [...subjects].sort((a, b) => (b.avgBrainMelt || 0) - (a.avgBrainMelt || 0))
  const worstMelt = sortedByMelt[0]

  if (bestSurvivor.id !== worstSurvivor.id && bestSurvivor.avgSurvival > 0) {
    const survivalDiff = Math.round(((bestSurvivor.avgSurvival - worstSurvivor.avgSurvival) / Math.max(worstSurvivor.avgSurvival, 1)) * 100)
    verdict = `Verdict: ${bestSurvivor.acronym} offers ${Math.max(survivalDiff, 15)}% higher survival odds than ${worstSurvivor.acronym}, but beware: ${worstMelt.acronym} will induce significant cognitive damage.`
  } else {
    verdict = `Verdict: An ensemble double-feature of existential dread. No obvious survivor here—prepare at 2x speed.`
  }

  res.json({
    subjects: subjects.map(s => ({
      ...s,
      departments: JSON.parse(s.departments),
      aliases: JSON.parse(s.aliases),
    })),
    radarData,
    verdict,
  })
})

export default router
