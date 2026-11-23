import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { requireAuth } from '../lib/auth'

const router = Router()
const prisma = new PrismaClient()

const ReportSchema = z.object({
  targetType: z.enum(['review', 'comment']),
  targetId: z.number().int(),
  reason: z.string().min(5).max(500),
})

router.post('/', requireAuth, async (req, res) => {
  const user = (req as any).user
  const parsed = ReportSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const report = await prisma.report.create({
    data: { reporterId: user.userId, ...parsed.data }
  })
  res.json({ report, message: 'Report submitted. Thank you.' })
})

export default router
