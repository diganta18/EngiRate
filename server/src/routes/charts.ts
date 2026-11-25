import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/charts/top - top rated subjects
router.get('/top', async (req, res) => {
  const { limit = '10' } = req.query
  const subjects = await prisma.subject.findMany({
    where: { status: 'approved', voteCount: { gt: 0 } },
    orderBy: { weightedScore: 'desc' },
    take: parseInt(limit as string),
    select: { id: true, slug: true, title: true, acronym: true, censorRating: true, weightedScore: true, avgOverall: true, voteCount: true, tagline: true }
  })
  res.json({ subjects })
})

// GET /api/charts/hardest - highest brain melt
router.get('/hardest', async (req, res) => {
  const { limit = '10' } = req.query
  const subjects = await prisma.subject.findMany({
    where: { status: 'approved', voteCount: { gt: 0 } },
    orderBy: { avgBrainMelt: 'desc' },
    take: parseInt(limit as string),
    select: { id: true, slug: true, title: true, acronym: true, censorRating: true, avgBrainMelt: true, voteCount: true, tagline: true }
  })
  res.json({ subjects })
})

// GET /api/charts/easiest - highest survival
router.get('/easiest', async (req, res) => {
  const { limit = '10' } = req.query
  const subjects = await prisma.subject.findMany({
    where: { status: 'approved', voteCount: { gt: 0 } },
    orderBy: { avgSurvival: 'desc' },
    take: parseInt(limit as string),
    select: { id: true, slug: true, title: true, acronym: true, censorRating: true, avgSurvival: true, voteCount: true, tagline: true }
  })
  res.json({ subjects })
})

// GET /api/charts/most-controversial - highest stddev
router.get('/most-controversial', async (req, res) => {
  const { limit = '10' } = req.query
  const subjects = await prisma.subject.findMany({
    where: { status: 'approved', voteCount: { gt: 2 } },
    orderBy: { scoreStddev: 'desc' },
    take: parseInt(limit as string),
    select: { id: true, slug: true, title: true, acronym: true, censorRating: true, scoreStddev: true, avgOverall: true, voteCount: true }
  })
  res.json({ subjects })
})

// GET /api/charts/genre-breakdown - genre distribution across all ratings
router.get('/genre-breakdown', async (req, res) => {
  const ratings = await prisma.rating.findMany({ select: { genres: true } })
  const count: Record<string, number> = {}
  for (const r of ratings) {
    const genres: string[] = JSON.parse(r.genres)
    for (const g of genres) count[g] = (count[g] || 0) + 1
  }
  const breakdown = Object.entries(count)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
  res.json({ breakdown })
})

// GET /api/charts/status-distribution
router.get('/status-distribution', async (req, res) => {
  const ratings = await prisma.rating.groupBy({
    by: ['statusTag'],
    _count: { statusTag: true }
  })
  res.json({ distribution: ratings.map(r => ({ status: r.statusTag, count: r._count.statusTag })) })
})

export default router
