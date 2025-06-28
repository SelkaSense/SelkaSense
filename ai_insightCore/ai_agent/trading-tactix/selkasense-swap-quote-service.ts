import fetch from "node-fetch"

type Mint = string

/**
 * Raw quote returned by an external liquidity-pool service
 */
interface PoolQuote {
  poolId: string
  inputAmount: number       // base units (e.g. lamports)
  outputAmount: number      // base units
  estimatedFee: number      // base units
}

/**
 * Normalised, user-facing quote
 */
export interface SwapQuote {
  bestPool: string
  amountOut: number         // net output after fees
  fee: number               // fee in base units
  slippagePercent: number   // % versus mid-price
  timestamp: number         // ms epoch
}

export class SwapQuoteService {
  constructor(private readonly apiUrl: string) {}

  /** ---------------------------------------------------------------- **\
   *                            PRIVATE HELPERS                         *
  \** ---------------------------------------------------------------- **/

  /** Pull quotes from every pool the aggregator exposes                */
  private async fetchPoolQuotes(
    inputMint: Mint,
    outputMint: Mint,
    amountIn: number
  ): Promise<PoolQuote[]> {
    const url = `${this.apiUrl}/quotes?in=${inputMint}&out=${outputMint}&amt=${amountIn}`

    const res = await fetch(url, { method: "GET", timeout: 10_000 })
    if (!res.ok) throw new Error(`Quote API error ${res.status}: ${res.statusText}`)

    return (await res.json()) as PoolQuote[]
  }

  /** Choose the pool with the best net output (after fees)             */
  private pickBest(quotes: PoolQuote[]): PoolQuote {
    return quotes.reduce((best, q) =>
      q.outputAmount - q.estimatedFee > best.outputAmount - best.estimatedFee ? q : best
    )
  }

  /** Simple slippage versus mid-market price                           */
  private calcSlippage(
    amountIn: number,
    amountOut: number,
    midPrice: number
  ): number {
    const expected = amountIn * midPrice
    return expected === 0 ? 0 : ((expected - amountOut) / expected) * 100
  }

  /** ---------------------------------------------------------------- **\
   *                            PUBLIC METHOD                           *
  \** ---------------------------------------------------------------- **/

  /**
   * Fetch quotes, pick the best and return a user-friendly summary
   */
  async getBestSwapQuote(
    inputMint: Mint,
    outputMint: Mint,
    amountIn: number,
    midPrice: number
  ): Promise<SwapQuote> {
    const poolQuotes = await this.fetchPoolQuotes(inputMint, outputMint, amountIn)
    if (poolQuotes.length === 0)
      throw new Error("No liquidity pools available for this pair")

    const best = this.pickBest(poolQuotes)

    const netOut = best.outputAmount - best.estimatedFee
    const slippage = Math.max(this.calcSlippage(amountIn, netOut, midPrice), 0)

    return {
      bestPool: best.poolId,
      amountOut: netOut,
      fee: best.estimatedFee,
      slippagePercent: slippage,
      timestamp: Date.now(),
    }
  }
}
