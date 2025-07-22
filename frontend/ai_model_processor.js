// aiModule.ts

export interface Metric {
  accuracy: number       // [0…1]
  latency: number        // in ms
  consistency: number    // [0…1]
  timestamp: number
}

export type Status = 'Optimal' | 'Stable' | 'Unstable'

export class AIModule {
  public readonly id: string
  private history: Metric[] = []

  // configurable weights
  private readonly weights = {
    accuracy: 0.5,
    latency: 0.3,      // will be applied to inverted & normalized latency
    consistency: 0.2
  }

  constructor(id: string) {
    this.id = id
  }

  /** add a new metric snapshot */
  updateMetrics(data: Omit<Metric, 'timestamp'>): void {
    this.history.push({ ...data, timestamp: Date.now() })
  }

  /** return the most recent raw metrics or null */
  get currentMetrics(): Metric | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null
  }

  /** compute trust index based on currentMetrics, normalized between 0 and 1 */
  calculateTrustIndex(): number {
    const m = this.currentMetrics
    if (!m) return 0

    // normalize latency: higher latency → lower score
    const maxLatency = 250  // assumed cap
    const invLatency = Math.max(0, (maxLatency - m.latency) / maxLatency)

    const score =
      m.accuracy * this.weights.accuracy +
      invLatency * this.weights.latency +
      m.consistency * this.weights.consistency

    return parseFloat(score.toFixed(4))
  }

  /** status based on thresholds */
  predictStatus(): Status {
    const trust = this.calculateTrustIndex()
    if (trust >= 0.9) return 'Optimal'
    if (trust >= 0.7) return 'Stable'
    return 'Unstable'
  }

  /** clear history */
  resetMetrics(): void {
    this.history = []
  }

  /** return how many snapshots recorded */
  getHistoryLength(): number {
    return this.history.length
  }

  /** fetch the last `n` snapshots, newest last */
  fetchSnapshot(n: number = 5): Metric[] {
    return this.history.slice(-n)
  }

  /** compute average of a history slice for a given key */
  average<K extends keyof Metric>(key: K, slice: Metric[] = this.history): number {
    if (slice.length === 0) return 0
    const sum = slice.reduce((acc, m) => acc + (m[key] as number), 0)
    return sum / slice.length
  }
}

// utils.ts

import { Metric } from './aiModule'

/** generate a random metric */
export function generateRandomMetric(): Omit<Metric, 'timestamp'> {
  return {
    accuracy: Math.random(),
    latency: Math.random() * 200 + 50,
    consistency: Math.random(),
  }
}

/** compute simple average of numbers */
export function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** normalize an array of values to [0…1] */
export function normalizeArray(values: number[]): number[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values.map(v => (v - min) / range)
}
