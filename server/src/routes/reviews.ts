import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, optionalAuth } from '../lib/auth'

const router = Router()

const REACTION_TYPES = ['felt_this', 'trauma', 'cap'] as const

// GET /api/reviews/subjects/:subjectId - list reviews for a subject
router.get('/subjects/:subjectId', optionalAuth, async (req, res) => {
  const subjectId = parseInt(req.params.subjectId as string, 10)
  const { sort = 'recent', page = '1', limit = '10' } = req.query
  const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10))
  const currentPage = Math.max(1, parseInt(page as string, 10) || 1)
  const skip = (currentPage - 1) * take

  const orderBy: any = sort === 'top'
    ? { feltThisCount: 'desc' }
    : sort === 'unhinged'
    ? { traumaCount: 'desc' }
    : { createdAt: 'desc' }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { subjectId, isHidden: false },
      orderBy,
      take,
      skip,
      include: {
        user: { select: { id: true, username: true, branch: true, gradYear: true } },
        rating: { select: { overall: true, survival: true, brainMelt: true, realValue: true, genres: true, statusTag: true } },
      }
    }),
    prisma.review.count({ where: { subjectId, isHidden: false } })
  ])

  const authUser = (req as any).user
  const enriched = await Promise.all(reviews.map(async (r) => {
    let userReaction = null
    if (authUser) {
      userReaction = await prisma.reviewReaction.findFirst({
        where: { reviewId: r.id, userId: authUser.userId }
      })
    }
    return {
      ...r,
      rating: { ...r.rating, genres: JSON.parse(r.rating.genres) },
      userReaction: userReaction?.reactionType || null
    }
  }))

  res.json({ reviews: enriched, total, page: parseInt(page as string), pages: Math.ceil(total / take) })
})

// POST /api/reviews/:reviewId/react - toggle a reaction
router.post('/:reviewId/react', requireAuth, async (req, res) => {
  const user = (req as any).user
  const reviewId = parseInt(req.params.reviewId as string, 10)
  const { reactionType } = z.object({ reactionType: z.enum(REACTION_TYPES) }).parse(req.body)

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) return res.status(404).json({ error: 'Review not found' })
  if (review.userId === user.userId) return res.status(400).json({ error: 'Cannot react to your own review' })

  const existing = await prisma.reviewReaction.findUnique({
    where: { reviewId_userId_reactionType: { reviewId, userId: user.userId, reactionType } }
  })

  const countField = reactionType === 'felt_this' ? 'feltThisCount' : reactionType === 'trauma' ? 'traumaCount' : 'capCount'

  if (existing) {
    await prisma.reviewReaction.delete({ where: { id: existing.id } })
    await prisma.review.update({ where: { id: reviewId }, data: { [countField]: { decrement: 1 } } })
    return res.json({ toggled: false, reactionType })
  }

  await prisma.reviewReaction.create({ data: { reviewId, userId: user.userId, reactionType } })
  await prisma.review.update({ where: { id: reviewId }, data: { [countField]: { increment: 1 } } })
  res.json({ toggled: true, reactionType })
})

// GET /api/reviews/:reviewId/comments
router.get('/:reviewId/comments', optionalAuth, async (req, res) => {
  const reviewId = parseInt(req.params.reviewId as string, 10)
  const comments = await prisma.comment.findMany({
    where: { reviewId, isHidden: false },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, username: true } } }
  })
  res.json({ comments })
})

// POST /api/reviews/:reviewId/comments
router.post('/:reviewId/comments', requireAuth, async (req, res) => {
  const user = (req as any).user
  const reviewId = parseInt(req.params.reviewId as string, 10)
  const { body } = z.object({ body: z.string().min(1).max(300) }).parse(req.body)

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) return res.status(404).json({ error: 'Review not found' })

  const comment = await prisma.comment.create({
    data: { reviewId, userId: user.userId, body },
    include: { user: { select: { id: true, username: true } } }
  })
  res.json({ comment })
})

// DELETE /api/reviews/:reviewId/comments/:commentId
router.delete('/:reviewId/comments/:commentId', requireAuth, async (req, res) => {
  const user = (req as any).user
  const commentId = parseInt(req.params.commentId as string, 10)
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) return res.status(404).json({ error: 'Comment not found' })
  if (comment.userId !== user.userId && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  await prisma.comment.delete({ where: { id: commentId } })
  res.json({ message: 'Comment deleted' })
})

export default router
