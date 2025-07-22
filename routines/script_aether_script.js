// rateLimiter.ts

type ResolveFn = () => void

export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly refillRate: number // tokens per ms
  private readonly queue: { count: number; resolve: ResolveFn }[] = []

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
    this.refillRate = capacity / refillMs
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed <= 0) return
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
  }

  /**
   * Attempt to consume `count` tokens immediately.
   * @returns true if tokens were available and consumed
   */
  tryConsume(count: number = 1): boolean {
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      return true
    }
    return false
  }

  /**
   * Consume `count` tokens, waiting until available.
   * Resolves once tokens have been consumed.
   */
  async acquire(count: number = 1): Promise<void> {
    if (this.tryConsume(count)) return
    return new Promise<void>(resolve => {
      this.queue.push({ count, resolve })
      this.scheduleRefillCheck()
    })
  }

  /** Number of tokens available (integer) */
  remaining(): number {
    this.refill()
    return Math.floor(this.tokens)
  }

  private scheduleRefillCheck(): void {
    setTimeout(() => {
      this.refill()
      this.processQueue()
      if (this.queue.length > 0) {
        this.scheduleRefillCheck()
      }
    }, Math.max(1, this.refillMs / this.capacity))
  }

  private processQueue(): void {
    for (let i = 0; i < this.queue.length; ) {
      const { count, resolve } = this.queue[i]
      if (this.tokens >= count) {
        this.tokens -= count
        resolve()
        this.queue.splice(i, 1)
      } else {
        i++
      }
    }
  }
}
