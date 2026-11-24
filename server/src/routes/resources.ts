import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, optionalAuth } from '../lib/auth'

const router = Router()

export const RESOURCE_TYPES = ['YouTube', 'Notes', 'CrashCourse', 'PYQ'] as const

// GET /api/subjects/:subjectId/resources
router.get('/:subjectId/resources', optionalAuth, async (req, res) => {
  const subjectId = parseInt(req.params.subjectId as string, 10)

  const resources = await prisma.studyResource.findMany({
    where: { subjectId },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { upvotes: 'desc' }
  })

  // Group by resourceType
  const grouped: Record<string, typeof resources> = {
    'YouTube': [],
    'CrashCourse': [],
    'Notes': [],
    'PYQ': [],
  }

  resources.forEach(r => {
    if (grouped[r.resourceType]) {
      grouped[r.resourceType].push(r)
    }
  })

  res.json({ resources, grouped, total: resources.length })
})

// POST /api/subjects/:subjectId/resources - submit emergency survival resource
router.post('/:subjectId/resources', requireAuth, async (req, res) => {
  const user = (req as any).user
  const subjectId = parseInt(req.params.subjectId as string, 10)

  const ResourceSchema = z.object({
    title: z.string().min(3).max(120),
    url: z.string().url('Please enter a valid URL (http/https)'),
    resourceType: z.enum(RESOURCE_TYPES),
  })

  const parsed = ResourceSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  const resource = await prisma.studyResource.create({
    data: {
      subjectId,
      userId: user.userId,
      title: parsed.data.title,
      url: parsed.data.url,
      resourceType: parsed.data.resourceType,
      upvotes: 1,
    },
    include: { user: { select: { id: true, username: true } } }
  })

  res.json({ resource })
})

// POST /api/resources/:resourceId/upvote
router.post('/:resourceId/upvote', requireAuth, async (req, res) => {
  const resourceId = parseInt(req.params.resourceId as string, 10)

  const resource = await prisma.studyResource.update({
    where: { id: resourceId },
    data: { upvotes: { increment: 1 } },
    include: { user: { select: { id: true, username: true } } }
  })

  res.json({ resource })
})

export default router
