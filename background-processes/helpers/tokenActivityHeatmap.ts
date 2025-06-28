import { PublicKey } from "@solana/web3.js"

export interface TimeBucket {
  hour: number
  txCount: number
  avgVolume: number
}

export interface HeatmapReport {
  mint: string
  peakHours: number[]
  buckets: TimeBucket[]
}

export async function generateTokenActivityHeatmap(
  connection: any,
  mintAddress: string,
  hoursBack: number = 24
): Promise<HeatmapReport> {
  const mint = new PublicKey(mintAddress)
  const now = Math.floor(Date.now() / 1000)
  const since = now - hoursBack * 3600
  const txMap: Map<number, number[]> = new Map()

  const signatures = await connection.getSignaturesForAddress(mint, { limit: 500 })
  for (const sig of signatures) {
    if (!sig.blockTime || sig.blockTime < since) continue
    const hour = new Date(sig.blockTime * 1000).getUTCHours()
    if (!txMap.has(hour)) txMap.set(hour, [])
    txMap.get(hour)?.push(sig.slot)
  }

  const buckets: TimeBucket[] = []
  for (let h = 0; h < 24; h++) {
    const entries = txMap.get(h) || []
    const txCount = entries.length
    const avgVolume = parseFloat((Math.random() * 100).toFixed(2)) // временная заглушка
    buckets.push({ hour: h, txCount, avgVolume })
  }

  const peak = Math.max(...buckets.map(b => b.txCount))
  const peakHours = buckets.filter(b => b.txCount === peak).map(b => b.hour)

  return {
    mint: mint.toBase58(),
    peakHours,
    buckets
  }
}
