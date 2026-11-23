import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth, optionalAuth } from '../lib/auth'

const router = Router()
const prisma = new PrismaClient()

function computeCriticPersona(ratings: { overall: number; statusTag: string; createdAt: Date }[]): string {
  if (ratings.length === 0) return 'The Connoisseur'
  
  const avg = ratings.reduce((s, r) => s + r.overall, 0) / ratings.length
  if (avg >= 8.5) return 'The Optimist'
  if (avg <= 4.5) return 'The Realist'
  
  const stddev = Math.sqrt(ratings.reduce((s, r) => s + Math.pow(r.overall - avg, 2), 0) / ratings.length)
  if (stddev >= 2.5) return 'The Chaos Agent'
  
  const backlogCount = ratings.filter((r) => r.statusTag === 'Got a Backlog').length
  if (backlogCount >= 3) return 'The Phoenix'
  
  if (ratings.length >= 15) return 'The Veteran'
  
  const nightCount = ratings.filter((r) => {
    const hour = new Date(r.createdAt).getHours()
    return hour >= 0 && hour < 5
  }).length
  if (nightCount > ratings.length / 2) return 'The Night-Before Critic'
  
  return 'The Connoisseur'
}

// GET /api/users/:username - public profile
router.get('/:username', optionalAuth, async (req, res) => {
  const username = req.params.username as string
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, username: true, branch: true, gradYear: true, bio: true, topFourIds: true, createdAt: true,
      ratings: {
        select: { overall: true, statusTag: true, createdAt: true, subject: { select: { id: true, slug: true, title: true, acronym: true } } },
        orderBy: { createdAt: 'desc' }
      },
      reviews: {
        where: { isHidden: false },
        select: { id: true, headline: true, body: true, createdAt: true, feltThisCount: true, subject: { select: { slug: true, title: true, acronym: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: { select: { ratings: true, reviews: true } }
    }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const topFourIds: number[] = JSON.parse(user.topFourIds)
  const topFour = topFourIds.length > 0
    ? await prisma.subject.findMany({ where: { id: { in: topFourIds } }, select: { id: true, slug: true, title: true, acronym: true } })
    : []

  const criticPersona = computeCriticPersona(user.ratings)

  res.json({
    user: {
      ...user,
      topFourIds,
      topFour,
      criticPersona,
      ratingCount: user._count.ratings,
    }
  })
})

// PUT /api/users/top-four - update top 4 subjects
router.put('/top-four', requireAuth, async (req, res) => {
  const authUser = (req as any).user
  const { subjectIds } = z.object({ subjectIds: z.array(z.number().int()).max(4) }).parse(req.body)
  await prisma.user.update({
    where: { id: authUser.userId },
    data: { topFourIds: JSON.stringify(subjectIds) }
  })
  res.json({ message: 'Top four updated', subjectIds })
})

// GET /api/users/:username/ratings - all ratings by user
router.get('/:username/ratings', async (req, res) => {
  const username = req.params.username as string
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const ratings = await prisma.rating.findMany({
    where: { userId: user.id },
    include: { subject: { select: { id: true, slug: true, title: true, acronym: true, censorRating: true } }, review: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json({ ratings: ratings.map(r => ({ ...r, genres: JSON.parse(r.genres) })) })
})

export default router
