import { describe, it, expect } from 'vitest'
import generateCryptoUID from '@/utils/generateCryptoUID'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

describe('generateCryptoUID', () => {
  it('generates a valid UUID string', () => {
    const id = generateCryptoUID()
    expect(id).toMatch(UUID_PATTERN)
  })

  it('generates unique values across calls', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateCryptoUID()))
    expect(ids.size).toBe(50)
  })
})
