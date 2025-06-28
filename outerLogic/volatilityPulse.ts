import { getTrendingTokens } from "@/getTrendingTokens"

interface WhaleSpike {
  token: string
  address: string
  priceUsd: string
  volume24h: number
  liquidity: number
  txCount: number
  spikeDetected: boolean
}

export async function detectWhaleSpikes(thresholdUSD = 10000): Promise<WhaleSpike[]> {
  const trending = await getTrendingTokens()

  return trending
    .filter(t => t.volume.h24 > thresholdUSD)
    .map(token => {
      const isSpike = token.volume.h24 / token.liquidity.usd > 2.5

      return {
        token: token.baseToken.symbol,
        address: token.baseToken.address,
        priceUsd: token.priceUsd,
        volume24h: token.volume.h24,
        liquidity: token.liquidity.usd,
        txCount: token.txCount.h24,
        spikeDetected: isSpike
      }
    })
}
