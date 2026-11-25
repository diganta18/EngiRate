import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, optionalAuth } from '../lib/auth'

const router = Router()

// Helper to make slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/lists
router.get('/', optionalAuth, async (req, res) => {
  const lists = await prisma.userList.findMany({
    include: {
      user: { select: { id: true, username: true } },
      _count: { select: { likes: true } }
    },
    orderBy: { likesCount: 'desc' }
  })

  // Enrich with subjects
  const enriched = await Promise.all(lists.map(async (l) => {
    const ids: number[] = JSON.parse(l.subjectIds)
    const previewSubjects = await prisma.subject.findMany({
      where: { id: { in: ids.slice(0, 4) } },
      select: { id: true, slug: true, title: true, acronym: true, censorRating: true }
    })
    return {
      ...l,
      subjectIds: ids,
      previewSubjects,
      subjectCount: ids.length,
    }
  }))

  res.json({ lists: enriched })
})

// GET /api/lists/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  const slug = req.params.slug as string
  const authUser = (req as any).user

  const list = await prisma.userList.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, username: true, branch: true } },
    }
  })
  if (!list) return res.status(404).json({ error: 'Watchlist not found' })

  const subjectIds: number[] = JSON.parse(list.subjectIds)
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } }
  })

  // Keep user-specified order
  const orderedSubjects = subjectIds.map(id => subjects.find(s => s.id === id)).filter(Boolean).map(s => ({
    ...s,
    departments: JSON.parse(s!.departments),
    aliases: JSON.parse(s!.aliases),
  }))

  let hasLiked = false
  if (authUser) {
    const like = await prisma.userListLike.findUnique({
      where: { listId_userId: { listId: list.id, userId: authUser.userId } }
    })
    hasLiked = !!like
  }

  res.json({
    list: {
      ...list,
      subjectIds,
      subjects: orderedSubjects,
      hasLiked,
    }
  })
})

// POST /api/lists - create list
router.post('/', requireAuth, async (req, res) => {
  const user = (req as any).user
  const ListSchema = z.object({
    title: z.string().min(3).max(80),
    description: z.string().max(300).optional(),
    subjectIds: z.array(z.number().int()).min(1).max(20),
  })

  const parsed = ListSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const baseSlug = slugify(parsed.data.title)
  let slug = baseSlug
  let count = 1
  while (await prisma.userList.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`
  }

  const list = await prisma.userList.create({
    data: {
      userId: user.userId,
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      subjectIds: JSON.stringify(parsed.data.subjectIds),
    }
  })

  res.json({ list })
})

// POST /api/lists/:slug/like - toggle like
router.post('/:slug/like', requireAuth, async (req, res) => {
  const user = (req as any).user
  const slug = req.params.slug as string

  const list = await prisma.userList.findUnique({ where: { slug } })
  if (!list) return res.status(404).json({ error: 'Watchlist not found' })

  const existing = await prisma.userListLike.findUnique({
    where: { listId_userId: { listId: list.id, userId: user.userId } }
  })

  if (existing) {
    await prisma.userListLike.delete({ where: { id: existing.id } })
    const updated = await prisma.userList.update({
      where: { id: list.id },
      data: { likesCount: { decrement: 1 } }
    })
    return res.json({ hasLiked: false, likesCount: updated.likesCount })
  } else {
    await prisma.userListLike.create({
      data: { listId: list.id, userId: user.userId }
    })
    const updated = await prisma.userList.update({
      where: { id: list.id },
      data: { likesCount: { increment: 1 } }
    })
    return res.json({ hasLiked: true, likesCount: updated.likesCount })
  }
})

export default router
