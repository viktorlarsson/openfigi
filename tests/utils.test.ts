import { describe, expect, it } from 'vitest'
import { exponentialBackoff, parseRateLimitHeaders, sleep } from '../src/utils/helpers'

describe('Utils', () => {
  describe('sleep', () => {
    it('should delay for specified milliseconds', async () => {
      const start = Date.now()
      await sleep(100)
      const elapsed = Date.now() - start
      // Allow for small timing variations in CI environments
      expect(elapsed).toBeGreaterThanOrEqual(95)
      expect(elapsed).toBeLessThan(200)
    })
  })

  describe('parseRateLimitHeaders', () => {
    it('should parse rate limit headers correctly', () => {
      const headers = new Headers({
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '50',
        'x-ratelimit-reset': '1609459200',
      })

      const result = parseRateLimitHeaders(headers)

      expect(result.limit).toBe(100)
      expect(result.remaining).toBe(50)
      expect(result.reset).toEqual(new Date(1609459200 * 1000))
    })

    it('should handle missing headers', () => {
      const headers = new Headers()
      const result = parseRateLimitHeaders(headers)

      expect(result.limit).toBeUndefined()
      expect(result.remaining).toBeUndefined()
      expect(result.reset).toBeUndefined()
    })
  })

  describe('exponentialBackoff', () => {
    it('should calculate backoff with exponential growth', () => {
      const delay1 = exponentialBackoff(0, 1000)
      const delay2 = exponentialBackoff(1, 1000)
      const delay3 = exponentialBackoff(2, 1000)

      expect(delay1).toBeGreaterThanOrEqual(1000)
      expect(delay1).toBeLessThan(1100)

      expect(delay2).toBeGreaterThanOrEqual(2000)
      expect(delay2).toBeLessThan(2200)

      expect(delay3).toBeGreaterThanOrEqual(4000)
      expect(delay3).toBeLessThan(4400)
    })

    it('should respect max delay', () => {
      const delay = exponentialBackoff(10, 1000, 5000)
      expect(delay).toBeLessThanOrEqual(5500)
    })
  })
})
