import { Router, Request, Response } from 'express'
import argon2 from 'argon2'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signToken, verifyToken, requireAuth, GUEST_COOKIE_NAME } from '../lib/auth'

const router = Router()

/**
 * Transfers any ratings and reviews created under an anonymous guest session
 * to a newly registered or logged-in user account, then cleans up the guest row.
 */
async function claimGuestRatings(req: Request, res: Response, targetUserId: number): Promise<number> {
  const guestToken = req.cookies?.[GUEST_COOKIE_NAME]
  if (!guestToken) return 0

  try {
    const payload = verifyToken(guestToken)
    if (!payload.isGuest || payload.userId === targetUserId) return 0

    const guestRatings = await prisma.rating.findMany({
      where: { userId: payload.userId },
      include: { review: true },
    })

    let claimedCount = 0
    for (const gr of guestRatings) {
      const conflict = await prisma.rating.findUnique({
        where: { userId_subjectId: { userId: targetUserId, subjectId: gr.subjectId } },
      })
      if (!conflict) {
        await prisma.rating.update({
          where: { id: gr.id },
          data: { userId: targetUserId },
        })
        if (gr.review) {
          await prisma.review.update({
            where: { id: gr.review.id },
            data: { userId: targetUserId },
          })
        }
        claimedCount++
      }
    }

    await prisma.user.deleteMany({
      where: { id: payload.userId, role: 'guest' },
    })
    res.clearCookie(GUEST_COOKIE_NAME)
    return claimedCount
  } catch {
    return 0
  }
}

const RegisterSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  branch: z.string().optional(),
  gradYear: z.number().int().min(2000).max(2035).optional(),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { username, email, password, branch, gradYear } = parsed.data

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existing) return res.status(409).json({ error: 'Username or email already taken' })

  const passwordHash = await argon2.hash(password)
  const user = await prisma.user.create({ data: { username, email, passwordHash, branch, gradYear } })

  const claimedCount = await claimGuestRatings(req, res, user.id)

  const token = signToken({ userId: user.id, username: user.username, role: user.role })
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({
    user: { id: user.id, username: user.username, email: user.email, role: user.role, branch: user.branch, gradYear: user.gradYear },
    claimedGuestRatings: claimedCount,
  })
})

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await argon2.verify(user.passwordHash, password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const claimedCount = await claimGuestRatings(req, res, user.id)

  const token = signToken({ userId: user.id, username: user.username, role: user.role })
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({
    user: { id: user.id, username: user.username, email: user.email, role: user.role, branch: user.branch, gradYear: user.gradYear },
    claimedGuestRatings: claimedCount,
  })
})

router.post('/claim-guest', requireAuth, async (req, res) => {
  const user = (req as any).user
  const claimedCount = await claimGuestRatings(req, res, user.userId)
  res.json({ claimedGuestRatings: claimedCount })
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = (req as any).user
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
  if (!dbUser) return res.status(404).json({ error: 'User not found' })
  res.json({ user: { id: dbUser.id, username: dbUser.username, email: dbUser.email, role: dbUser.role, branch: dbUser.branch, gradYear: dbUser.gradYear, bio: dbUser.bio, topFourIds: JSON.parse(dbUser.topFourIds) } })
})

router.put('/me', requireAuth, async (req, res) => {
  const user = (req as any).user
  const UpdateSchema = z.object({
    bio: z.string().max(300).optional(),
    branch: z.string().optional(),
    gradYear: z.number().int().optional(),
  })
  const parsed = UpdateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const updated = await prisma.user.update({ where: { id: user.userId }, data: parsed.data })
  res.json({ user: { id: updated.id, username: updated.username, branch: updated.branch, gradYear: updated.gradYear, bio: updated.bio } })
})

export default router
