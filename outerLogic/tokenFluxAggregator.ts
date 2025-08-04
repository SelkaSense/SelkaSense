import type { DexScreenerTokenPair } from "@/services/dexscreener"
import { getDexScreenerTokenPairs } from "@/services/dexscreener"

export interface AggregatedTokenStats {
  tokenSymbol: string
  tokenAddress: string
  priceUsd: number
  liquidity: number
  txCount24h: number
  volume24h: number
}

/** Simple in-memory cache for query results */
const statsCache = new Map<
  string,
  { ts: number; data: AggregatedTokenStats[] }
>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function aggregateSolanaTokenStats(
  query: string,
  options: {
    /** Minimum 24h volume to include (default 0) */
    minVolume24h?: number
    /** Max number of results to return (default no limit) */
    limit?: number
  } = {}
): Promise<AggregatedTokenStats[]> {
  const { minVolume24h = 0, limit } = options
  const cacheKey = `${query}|vol>${minVolume24h}|limit=${limit}`

  // Return cached if fresh
  const cached = statsCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  let pairs: DexScreenerTokenPair[]
  try {
    pairs = await getDexScreenerTokenPairs(query)
  } catch (err) {
    console.error("Failed to fetch token pairs:", err)
    return []
  }
  if (!Array.isArray(pairs) || pairs.length === 0) return []

  const stats: AggregatedTokenStats[] = pairs
    .filter((p) => p.chainId === "solana")
    .map((pair) => {
      const priceUsd = parseFloat(pair.priceUsd)
      const volume24h = Number(pair.volume.h24) || 0
      return {
        tokenSymbol: pair.baseToken.symbol,
        tokenAddress: pair.baseToken.address,
        priceUsd: isNaN(priceUsd) ? 0 : priceUsd,
        liquidity: pair.liquidity.usd || 0,
        txCount24h: pair.txCount.h24 || 0,
        volume24h,
      }
    })
    .filter((s) => s.volume24h >= minVolume24h)
    .sort((a, b) => b.volume24h - a.volume24h)

  const result = limit != null ? stats.slice(0, limit) : stats
  statsCache.set(cacheKey, { ts: Date.now(), data: result })
  return result
}
