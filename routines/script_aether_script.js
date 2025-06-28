// rateLimiter.ts

/**
 * Simple in-memory rate limiter (token-bucket).
 *
 * Usage:
 *   const limiter = new RateLimiter(10, 1000); // 10 tokens / second
 *   if (limiter.consume()) { /* proceed *\/ } else { /* too many requests *\/ }
 */
export class RateLimiter {
  /** Current token count */
  private tokens: number
  /** Last refill timestamp (ms) */
  private lastRefill: number

  /**
   * @param capacity   maximum burst size
   * @param refillMs   interval in milliseconds to fully refill the bucket
   */
  constructor(
    private readonly capacity: number,
    private readonly refillMs: number,
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  /** Refill tokens based on elapsed time */
  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed <= 0) return

    const tokensToAdd = (elapsed / this.refillMs) * this.capacity
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  /**
   * Attempt to consume one token.
   * @returns true  if a token was available
   *          false if rate limit exceeded
   */
  consume(): boolean {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }
    return false
  }

  /**
   * Get remaining tokens at this moment.
   */
  remaining(): number {
    this.refill()
    return Math.floor(this.tokens)
  }
}
