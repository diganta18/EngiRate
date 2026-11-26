import { describe, it, expect } from 'vitest'
import { sanitizeText } from '../src/lib/sanitize'

describe('Input Sanitization Utilities', () => {
  it('escapes HTML angle brackets to prevent XSS', () => {
    const raw = '<script>alert("xss")</script>'
    expect(sanitizeText(raw)).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  })

  it('escapes single and double quotes cleanly', () => {
    const raw = `He said "M3 is 'fine'"`
    expect(sanitizeText(raw)).toBe('He said &quot;M3 is &#39;fine&#39;&quot;')
  })

  it('trims leading and trailing whitespace without altering normal text', () => {
    const raw = '   Deadlocks and starvation are basically corporate life.   '
    expect(sanitizeText(raw)).toBe('Deadlocks and starvation are basically corporate life.')
  })
})
