import { SelkaSenseEngine } from './selkaSenseEngine'

export interface OnChainMetric {
  timestamp: number
  volume: number
  liquidity: number
  activeAddresses: number
}

export interface CorrelationResult {
  pair: readonly [keyof OnChainMetric, keyof OnChainMetric]
  coefficient: number
}

/** Pearson correlation for two numeric series of equal length */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n === 0 || y.length !== n) return 0

  const meanX = x.reduce((s, v) => s + v, 0) / n
  const meanY = y.reduce((s, v) => s + v, 0) / n

  let num = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    num += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const denom = Math.sqrt(denomX * denomY)
  return denom === 0 ? 0 : num / denom
}

/**
 * CorrelationAnalyzer for SelkaSense:
 * computes pairwise Pearson correlations between
 * volume, liquidity, and activeAddresses
 */
export class CorrelationAnalyzer {
  private readonly engine: SelkaSenseEngine

  constructor(apiUrl: string, apiKey: string) {
    this.engine = new SelkaSenseEngine(apiUrl, apiKey)
  }

  async analyze(
    contractAddress: string,
    periodHours: number
  ): Promise<CorrelationResult[]> {
    const metrics = await this.engine.fetchMetrics(
      contractAddress,
      periodHours
    ) as OnChainMetric[]

    if (!metrics.length) return []

    const series = {
      volume: metrics.map(m => m.volume),
      liquidity: metrics.map(m => m.liquidity),
      activeAddres
