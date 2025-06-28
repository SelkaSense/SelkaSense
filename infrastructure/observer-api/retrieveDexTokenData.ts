export interface DexScreenerPairData {
  pairAddress: string
  baseToken: {
    name: string
    symbol: string
    address: string
  }
  quoteToken: {
    name: string
    symbol: string
    address: string
  }
  priceUsd: string
  liquidity: {
    usd: number
  }
  volume: {
    h24: number
    h6: number
    h1: number
  }
  txCount: {
    h24: number
    h6: number
    h1: number
  }
  createdAt: number
}

export async function getDexScreenerTokenData(
  tokenAddress: string
): Promise<DexScreenerPairData | null> {
  const endpoint = `https://api.dexscreener.com/latest/dex/pairs/solana/${tokenAddress}`

  try {
    const response = await fetch(endpoint, { method: "GET" })

    if (!response.ok) {
      console.warn(`[DexScreener] ❌ Bad response for ${tokenAddress}: ${response.status}`)
      return null
    }

    const json = await response.json()

    if (!json?.pair || typeof json.pair !== "object") {
      console.warn(`[DexScreener] ⚠️ No pair data found for token ${tokenAddress}`)
      return null
    }

    const pair: DexScreenerPairData = {
      pairAddress: json.pair.pairAddress,
      baseToken: json.pair.baseToken,
      quoteToken: json.pair.quoteToken,
      priceUsd: json.pair.priceUsd,
      liquidity: json.pair.liquidity,
      volume: json.pair.volume,
      txCount: json.pair.txCount,
      createdAt: json.pair.createdAt,
    }

    console.log(`[DexScreener] ✅ Data fetched for token: ${tokenAddress}`)
    return pair
  } catch (error) {
    console.error(`[DexScreener] 🚨 Fetch failed for ${tokenAddress}:`, error)
    return null
  }
}
