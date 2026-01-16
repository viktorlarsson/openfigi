export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function parseRateLimitHeaders(headers: Headers): {
  limit?: number
  remaining?: number
  reset?: Date
} {
  const limit = headers.get('x-ratelimit-limit')
  const remaining = headers.get('x-ratelimit-remaining')
  const reset = headers.get('x-ratelimit-reset')

  return {
    limit: limit ? parseInt(limit, 10) : undefined,
    remaining: remaining ? parseInt(remaining, 10) : undefined,
    reset: reset ? new Date(parseInt(reset, 10) * 1000) : undefined,
  }
}

export function exponentialBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const delay = Math.min(baseDelay * 2 ** attempt, maxDelay)
  const jitter = Math.random() * 0.1 * delay
  return Math.floor(delay + jitter)
}
