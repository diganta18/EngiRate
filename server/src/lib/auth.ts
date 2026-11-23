import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JwtPayload {
  userId: number
  username: string
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
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
