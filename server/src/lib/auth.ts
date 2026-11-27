import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { ENV } from './env'
import { prisma } from './prisma'

const JWT_SECRET = ENV.JWT_SECRET
export const GUEST_COOKIE_NAME = 'guest_token'

export interface JwtPayload {
  userId: number
  username: string
  role: string
  isGuest?: boolean
}

export function signToken(payload: JwtPayload, expiresIn: string | number = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const payload = verifyToken(token)
    ;(req as any).user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token
  if (token) {
    try {
      const payload = verifyToken(token)
      ;(req as any).user = payload
    } catch {}
  }
  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

/**
 * Allows either an authenticated user OR an anonymous guest.
 * For first-time guests, issues a persistent signed guest_token cookie
 * backed by a lightweight guest user row to preserve 1-rating-per-subject Sybil defense.
 */
export async function requireAuthOrGuest(req: Request, res: Response, next: NextFunction) {
  const authToken = req.cookies?.token
  if (authToken) {
    try {
      const payload = verifyToken(authToken)
      ;(req as any).user = { ...payload, isGuest: false }
      return next()
    } catch {
      // fall through to guest token
    }
  }

  const guestToken = req.cookies?.[GUEST_COOKIE_NAME]
  if (guestToken) {
    try {
      const payload = verifyToken(guestToken)
      const exists = await prisma.user.findUnique({ where: { id: payload.userId } })
      if (exists) {
        ;(req as any).user = { ...payload, isGuest: true }
        return next()
      }
    } catch {
      // invalid guest token, mint a new one
    }
  }

  try {
    const suffix = crypto.randomBytes(4).toString('hex')
    const guestUser = await prisma.user.create({
      data: {
        username: `guest_${suffix}`,
        email: `guest_${suffix}@guest.engirate.local`,
        role: 'guest',
      },
    })

    const payload: JwtPayload = {
      userId: guestUser.id,
      username: guestUser.username,
      role: 'guest',
      isGuest: true,
    }
    const newGuestToken = signToken(payload, '30d')
    res.cookie(GUEST_COOKIE_NAME, newGuestToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    ;(req as any).user = payload
    return next()
  } catch (err) {
    return res.status(500).json({ error: 'Failed to initialize guest rating session' })
  }
}
