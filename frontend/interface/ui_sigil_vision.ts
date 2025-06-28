/**
 * Traffic-light–style risk signal based on volume, liquidity, and transaction bursts.
 *
 * @returns "high" | "moderate" | "normal"
 */
export function signalLight(
  volumeChange: number,     // % change versus baseline
  liquidityShift: number,   // % change in liquidity depth
  txSpike: number,          // % change in tx count
): "high" | "moderate" | "normal" {
  if (volumeChange > 150 && liquidityShift < 10 && txSpike > 60) {
    return "high"
  }
  if (volumeChange > 80) {
    return "moderate"
  }
  return "normal"
}

/**
 * Detects short-term market pulse anomalies.
 *
 * @returns "trend-spike" | "negative-shift" | "steady"
 */
export function dataPulse(
  priceDelta: number,       // % change over timeframe
  walletInflow: number,     // count of new wallets
  timeframeMinutes: number, // period length
): "trend-spike" | "negative-shift" | "steady" {
  const inflowRate = walletInflow / Math.max(timeframeMinutes, 1)
  if (priceDelta > 20 && inflowRate > 5) return "trend-spike"
  if (priceDelta < -15) return "negative-shift"
  return "steady"
}

/**
 * Bootstrap helper that logs activation time.
 */
export function activateSelkaSense(): void {
  // eslint-disable-next-line no-console
  console.log(`SelkaSense activated at ${new Date().toISOString()}`)
}
