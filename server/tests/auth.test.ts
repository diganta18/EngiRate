import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '../src/lib/auth'

describe('JWT Auth Token Utilities', () => {
  it('signs and verifies a valid user payload', () => {
    const payload = { userId: 42, username: 'nightbefore_critic', role: 'user' }
    const token = signToken(payload)

    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)

    const decoded = verifyToken(token)
    expect(decoded.userId).toBe(42)
    expect(decoded.username).toBe('nightbefore_critic')
    expect(decoded.role).toBe('user')
  })

  it('rejects tampered or malformed tokens', () => {
    const token = signToken({ userId: 1, username: 'admin', role: 'admin' })
    const tampered = token.slice(0, -4) + 'xxxx'

    expect(() => verifyToken(tampered)).toThrow()
    expect(() => verifyToken('not.a.valid.jwt')).toThrow()
  })
})
