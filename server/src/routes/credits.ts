import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, optionalAuth } from '../lib/auth'

const router = Router()

export const ROLES = ['Starring', 'Supporting Cast', 'Main Villain', 'Plot Twist'] as const

// GET /api/subjects/:subjectId/credits
router.get('/:subjectId/credits', optionalAuth, async (req, res) => {
  const subjectId = parseInt(req.params.subjectId as string, 10)

  const credits = await prisma.memeCredit.findMany({
    where: { subjectId },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { upvotes: 'desc' }
  })

  // Group by role
  const grouped: Record<string, typeof credits> = {
    'Starring': [],
    'Supporting Cast': [],
    'Main Villain': [],
    'Plot Twist': [],
  }

  credits.forEach(c => {
    if (grouped[c.roleLabel]) {
      grouped[c.roleLabel].push(c)
    }
  })

  res.json({ credits, grouped })
})

// POST /api/subjects/:subjectId/credits - submit new parody credit
router.post('/:subjectId/credits', requireAuth, async (req, res) => {
  const user = (req as any).user
  const subjectId = parseInt(req.params.subjectId as string, 10)
  const CreditSchema = z.object({
    roleLabel: z.enum(ROLES),
    creditText: z.string().min(2).max(100),
  })

  const parsed = CreditSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  const credit = await prisma.memeCredit.create({
    data: {
      subjectId,
      userId: user.userId,
      roleLabel: parsed.data.roleLabel,
      creditText: parsed.data.creditText,
      upvotes: 1
    },
    include: { user: { select: { id: true, username: true } } }
  })

  res.json({ credit })
})

// POST /api/credits/:creditId/upvote
router.post('/:creditId/upvote', requireAuth, async (req, res) => {
  const creditId = parseInt(req.params.creditId as string, 10)

  const credit = await prisma.memeCredit.update({
    where: { id: creditId },
    data: { upvotes: { increment: 1 } }
  })

  res.json({ credit })
})

export default router
