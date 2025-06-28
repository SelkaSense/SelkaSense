export interface TrendingToken {
  pairAddress: string
  dexId: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceUsd: string
  liquidity: {
    usd: number
  }
  volume: {
    h24: number
  }
  txCount: {
    h24: number
  }
  chainId: string
}

export async function getTrendingTokens(limit = 10): Promise<TrendingToken[]> {
  const endpoint = "https://api.dexscreener.com/latest/dex"

  try {
    const response = await fetch(endpoint, { method: "GET" })

    if (!response.ok) {
      console.warn(`[DexScreener] ❌ Bad response: ${response.status} ${response.statusText}`)
      return []
    }

    const result = await response.json()

    if (!Array.isArray(result.pairs)) {
      console.warn("[DexScreener] Unexpected API structure: missing 'pairs'")
      return []
    }

    const solanaPairs = result.pairs.filter((pair: any) => pair.chainId === "solana")

    const parsed: TrendingToken[] = solanaPairs
      .filter((pair) => pair.baseToken && pair.priceUsd && pair.liquidity?.usd > 0)
      .slice(0, limit)

    console.log(`[DexScreener] ✅ Fetched ${parsed.length} trending Solana tokens`)
    return parsed
  } catch (err) {
    console.error("[DexScreener] API fetch failed:", err)
    return []
  }
}
