export interface TimePoint {
  timestamp: number  // Unix epoch ms
  volume: number
  price: number
  liquidity: number
}

export interface FeatureVector {
  timestamp: number
  movingAverages: {
    short: number
    medium: number
    long: number
  }
  momentum: number
  volatility: number
  liquidityRatio: number
}

/** Fixed-size queue with O(1) average calculation */
class SlidingWindow {
  private readonly size: number
  private window: number[] = []
  private total = 0

  constructor(size: number) {
    this.size = size
  }

  add(value: number): void {
    this.window.push(value)
    this.total += value
    if (this.window.length > this.size) {
      this.total -= this.window.shift() as number
    }
  }

  average(): number {
    return this.window.length ? this.total / this.window.length : 0
  }
}

export class FeatureExtractor {
  /**
   * Generate feature vectors for the series.
   * If `timestampsToCompute` is empty, features are returned for every point.
   */
  static computeFeatures(
    data: TimePoint[],
    timestampsToCompute: number[] = []
  ): FeatureVector[] {
    const wShort = new SlidingWindow(5)
    const wMedium = new SlidingWindow(15)
    const wLong = new SlidingWindow(60)

    const vectors: FeatureVector[] = []
    let prevPrice: number | null = null
    const hourMs = 60 * 60 * 1000

    for (const point of data) {
      // rolling averages
      wShort.add(point.price)
      wMedium.add(point.price)
      wLong.add(point.price)

      const maShort = wShort.average()
      const maMedium = wMedium.average()
      const maLong = wLong.average()

      // momentum
      const momentum =
        prevPrice !== null && prevPrice !== 0
          ? (point.price - prevPrice) / prevPrice
          : 0

      // volatility (σ) over past hour
      const windowPrices = data
        .filter(
          p =>
            p.timestamp >= point.timestamp - hourMs &&
            p.timestamp <= point.timestamp
        )
        .map(p => p.price)

      const mean =
        windowPrices.reduce((acc, v) => acc + v, 0) /
        (windowPrices.length || 1)
      const variance =
        windowPrices.reduce((acc, v) => acc + (v - mean) ** 2, 0) /
        (windowPrices.length || 1)
      const volatility = Math.sqrt(variance)

      const liquidityRatio =
        point.liquidity !== 0 ? point.volume / point.liquidity : 0

      if (
        !timestampsToCompute.length ||
        timestampsToCompute.includes(point.timestamp)
      ) {
        vectors.push({
          timestamp: point.timestamp,
          movingAverages: { short: maShort, medium: maMedium, long: maLong },
          momentum,
          volatility,
          liquidityRatio,
        })
      }

      prevPrice = point.price
    }

    return vectors
  }
}
