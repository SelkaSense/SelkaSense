import fetch from "node-fetch"

/** A single trade tick */
interface TradeTick {
  timestamp: number   // ms epoch
  price: number       // quoted price
  size: number        // trade size (base units)
  side: "buy" | "sell"
}

/** Market-analytics helper class */
export class MarketAnalytics {
  constructor(private readonly apiUrl: string) {}

  /** -------------------------------------------------------------- **/
  /**                         DATA FETCHING                          **/
  /** -------------------------------------------------------------- **/

  /** Pull recent trade ticks for a market symbol */
  async fetchTradeHistory(
    marketSymbol: string,
    limit = 100
  ): Promise<TradeTick[]> {
    const url = `${this.apiUrl}/markets/${marketSymbol}/trades?limit=${limit}`

    const res = await fetch(url, { method: "GET", timeout: 10_000 })
    if (!res.ok) {
      throw new Error(`Trade history fetch error ${res.status}: ${res.statusText}`)
    }

    return (await res.json()) as TradeTick[]
  }

  /** -------------------------------------------------------------- **/
  /**                        CALCULATION UTILS                       **/
  /** -------------------------------------------------------------- **/

  /** Volume-weighted average price                                 */
  calculateVWAP(ticks: TradeTick[]): number {
    const { pvSum, volSum } = ticks.reduce(
      (acc, t) => {
        acc.pvSum += t.price * t.size
        acc.volSum += t.size
        return acc
      },
      { pvSum: 0, volSum: 0 }
    )
    return volSum > 0 ? pvSum / volSum : 0
  }

  /** Simple moving average for the last N ticks                     */
  simpleMovingAverage(ticks: TradeTick[], window = 20): number {
    const slice = ticks.slice(-window)
    const sum = slice.reduce((acc, t) => acc + t.price, 0)
    return slice.length ? sum / slice.length : 0
  }

  /** -------------------------------------------------------------- **/
  /**                       ARBITRAGE CHECK                          **/
  /** -------------------------------------------------------------- **/

  /**
   * Detect carry-trade opportunity between two markets.
   * Positive value ⇒ marketA trades higher than marketB.
   */
  async detectArbitrage(marketA: string, marketB: string): Promise<number> {
    const [aTicks, bTicks] = await Promise.all([
      this.fetchTradeHistory(marketA, 60),
      this.fetchTradeHistory(marketB, 60),
    ])

    const delta = this.calculateVWAP(aTicks) - this.calculateVWAP(bTicks)
    return Number(delta.toFixed(6))
  }
}
