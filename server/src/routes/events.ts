import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { optionalAuth } from '../lib/auth'

const router = Router()
const prisma = new PrismaClient()

const EventSchema = z.object({
  eventName: z.string().min(1).max(100),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

router.post('/', optionalAuth, async (req, res) => {
  const parsed = EventSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const authUser = (req as any).user
  await prisma.analyticsEvent.create({
    data: {
      eventName: parsed.data.eventName,
      userId: authUser?.userId || null,
      metadata: JSON.stringify(parsed.data.metadata),
    }
  })
  res.json({ ok: true })
})

export default router
