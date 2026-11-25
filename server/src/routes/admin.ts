import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireAdmin } from '../lib/auth'

const router = Router()

router.use(requireAuth, requireAdmin)

// GET /api/admin/reports - list open reports
router.get('/reports', async (req, res) => {
  const { status = 'open' } = req.query
  const reports = await prisma.report.findMany({
    where: { status: status as string },
    include: { reporter: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'desc' }
  })
  res.json({ reports })
})

// PATCH /api/admin/reports/:id - resolve/dismiss a report
router.patch('/reports/:id', async (req, res) => {
  const id = parseInt(req.params.id as string, 10)
  const { status, action } = z.object({
    status: z.enum(['resolved', 'dismissed']),
    action: z.enum(['hide', 'none']).optional()
  }).parse(req.body)

  const report = await prisma.report.findUnique({ where: { id } })
  if (!report) return res.status(404).json({ error: 'Report not found' })

  if (action === 'hide') {
    if (report.targetType === 'review') {
      await prisma.review.update({ where: { id: report.targetId }, data: { isHidden: true } })
    } else {
      await prisma.comment.update({ where: { id: report.targetId }, data: { isHidden: true } })
    }
  }

  await prisma.report.update({ where: { id }, data: { status } })
  res.json({ message: `Report ${status}` })
})

// GET /api/admin/stats - site-wide stats
router.get('/stats', async (req, res) => {
  const [users, subjects, ratings, reviews, reports] = await Promise.all([
    prisma.user.count(),
    prisma.subject.count(),
    prisma.rating.count(),
    prisma.review.count(),
    prisma.report.count({ where: { status: 'open' } }),
  ])
  res.json({ users, subjects, ratings, reviews, openReports: reports })
})

// GET /api/admin/subjects/pending
router.get('/subjects/pending', async (req, res) => {
  const subjects = await prisma.subject.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' } })
  res.json({ subjects })
})

// PATCH /api/admin/subjects/:id/approve
router.patch('/subjects/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id as string, 10)
  await prisma.subject.update({ where: { id }, data: { status: 'approved' } })
  res.json({ message: 'Subject approved' })
})

// DELETE /api/admin/subjects/:id
router.delete('/subjects/:id', async (req, res) => {
  const id = parseInt(req.params.id as string, 10)
  await prisma.subject.delete({ where: { id } })
  res.json({ message: 'Subject deleted' })
})

export default router
