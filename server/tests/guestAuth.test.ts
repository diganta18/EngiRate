import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '../src/lib/auth'

describe('Anonymous Guest Rating Session Tokens', () => {
  it('signs and verifies a 30-day guest session token with isGuest flag', () => {
    const guestPayload = {
      userId: 999,
      username: 'guest_a1b2c3d4',
      role: 'guest',
      isGuest: true,
    }

    const token = signToken(guestPayload, '30d')
    const decoded = verifyToken(token)

    expect(decoded.userId).toBe(999)
    expect(decoded.username).toBe('guest_a1b2c3d4')
    expect(decoded.role).toBe('guest')
    expect(decoded.isGuest).toBe(true)
  })

  it('distinguishes between authenticated user tokens and guest tokens', () => {
    const authToken = signToken({ userId: 10, username: 'critic1', role: 'user', isGuest: false })
    const decoded = verifyToken(authToken)

    expect(decoded.isGuest).toBe(false)
    expect(decoded.role).toBe('user')
  })
})
