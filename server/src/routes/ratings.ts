import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireAuthOrGuest } from '../lib/auth'
import { recalculateSubjectStats } from '../lib/bayesian'

const router = Router()

const GENRES = ['Psychological Horror', 'Filler Episode', 'Plot Twist Exam', 'Sleeper Hit', 'Slow Burn', 'Pure Fiction', 'Action-Thriller', 'Certified GPA Farmer'] as const
const STATUS_TAGS = ['Survived', 'Barely Escaped', 'Currently Suffering', 'Got a Backlog', 'Certified Topper'] as const

const RateSchema = z.object({
  overall: z.number().int().min(1).max(10),
  survival: z.number().int().min(1).max(10),
  brainMelt: z.number().int().min(1).max(10),
  realValue: z.number().int().min(1).max(10),
  genres: z.array(z.enum(GENRES)).max(3).optional().default([]),
  statusTag: z.enum(STATUS_TAGS),
  reviewHeadline: z.string().max(100).optional(),
  reviewBody: z.string().max(500).optional(),
})

router.post('/subjects/:subjectId/rate', requireAuthOrGuest, async (req, res) => {
  const user = (req as any).user
  const subjectId = parseInt(req.params.subjectId as string, 10)

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  const parsed = RateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { overall, survival, brainMelt, realValue, genres, statusTag, reviewHeadline, reviewBody } = parsed.data

  const rating = await prisma.rating.upsert({
    where: { userId_subjectId: { userId: user.userId, subjectId } },
    update: { overall, survival, brainMelt, realValue, genres: JSON.stringify(genres), statusTag },
    create: { userId: user.userId, subjectId, overall, survival, brainMelt, realValue, genres: JSON.stringify(genres), statusTag }
  })

  if (reviewBody) {
    await prisma.review.upsert({
      where: { ratingId: rating.id },
      update: { headline: reviewHeadline, body: reviewBody },
      create: { ratingId: rating.id, userId: user.userId, subjectId, headline: reviewHeadline, body: reviewBody }
    })
  }

  await recalculateSubjectStats(subjectId)

  const updatedSubject = await prisma.subject.findUnique({ where: { id: subjectId } })

  // Certificate payload
  const certNo = `CBSE-${new Date().getFullYear()}-${String(rating.id).padStart(6, '0')}`
  const certificate = {
    certNo,
    username: user.username,
    subjectTitle: subject.title,
    statusTag,
    overall,
    issuedAt: new Date().toISOString(),
  }

  res.json({ rating, subject: updatedSubject, certificate, isGuest: Boolean(user.isGuest) })
})

router.get('/subjects/:subjectId/my-rating', requireAuth, async (req, res) => {
  const user = (req as any).user
  const subjectId = parseInt(req.params.subjectId as string, 10)
  const rating = await prisma.rating.findUnique({
    where: { userId_subjectId: { userId: user.userId, subjectId } },
    include: { review: true }
  })
  res.json({ rating })
})

router.delete('/subjects/:subjectId/rate', requireAuth, async (req, res) => {
  const user = (req as any).user
  const subjectId = parseInt(req.params.subjectId as string, 10)
  await prisma.rating.deleteMany({ where: { userId: user.userId, subjectId } })
  await recalculateSubjectStats(subjectId)
  res.json({ message: 'Rating removed' })
})

export default router
