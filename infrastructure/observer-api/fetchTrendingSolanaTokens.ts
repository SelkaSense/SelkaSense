export interface DexScreenerTokenPair {
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
  volume: {
    h24: number
  }
  liquidity: {
    usd: number
  }
  txCount: {
    h24: number
  }
  chainId: string
}

export interface DexScreenerPairsResponse {
  pairs: DexScreenerTokenPair[]
}

export async function getDexScreenerTokenPairs(
  tokenSymbolOrAddress: string
): Promise<DexScreenerTokenPair[] | null> {
  const endpoint = `https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(tokenSymbolOrAddress)}`
  try {
    const res = await fetch(endpoint, { method: "GET" })

    if (!res.ok) {
      console.warn(`[DexScreener] ❌ Bad response (${res.status}) while searching for: ${tokenSymbolOrAddress}`)
      return null
    }

    const data = await res.json()

    if (!Array.isArray(data?.pairs)) {
      console.warn(`[DexScreener] ⚠️ Invalid 'pairs' structure in response for: ${tokenSymbolOrAddress}`)
      return null
    }

    const solanaPairs = data.pairs.filter(
      (pair: any): pair is DexScreenerTokenPair => pair?.chainId === "solana"
    )

    if (solanaPairs.length === 0) {
      console.log(`[DexScreener] ℹ️ No Solana pairs found for: ${tokenSymbolOrAddress}`)
    } else {
      console.log(`[DexScreener] ✅ Found ${solanaPairs.length} Solana pair(s) for: ${tokenSymbolOrAddress}`)
    }

    return solanaPairs
  } catch (error) {
    console.error(`[DexScreener] 🚨 Fetch error for '${tokenSymbolOrAddress}':`, error)
    return null
  }
}
