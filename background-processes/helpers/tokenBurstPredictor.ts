import { getDexScreenerTokenData } from "@/integrations/dexscreener"
import { analyzeVolatility } from "@/core/volatilityUtils"

interface BurstPrediction {
  token: string
  volatilityScore: number
  trend: "bullish" | "bearish" | "neutral"
  burstLikelihood: number  // 0 to 100
  confidence: number       // 0 to 1
}

export async function predictTokenBurst(mint: string): Promise<BurstPrediction | null> {
  const data = await getDexScreenerTokenData(mint)
  if (!data) return null

  const volatility = analyzeVolatility(data.volume.h1, data.volume.h6, data.volume.h24)

  const burstLikelihood = Math.min(100, volatility * 1.3 + (data.txCount.h1 / 10))
  const trend = data.priceUsd > "1.0" ? "bullish" : "bearish"
  const confidence = Math.min(1, (data.txCount.h1 + data.txCount.h6) / 100)

  return {
    token: data.baseToken.symbol,
    volatilityScore: volatility,
    trend,
    burstLikelihood: parseFloat(burstLikelihood.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
  }
}