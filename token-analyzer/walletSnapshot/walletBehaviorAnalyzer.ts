// analyzeWalletBehavior.ts

type WalletBehaviorInput = {
  txCount24h: number
  avgTxValue: number
  distinctTokensInteracted: number
  creationTimestamp: number
}

type WalletBehaviorResult = {
  label: string
  score: number
  flags: string[]
}

/**
 * Analyzes wallet behavior to detect anomalies or risk.
 */
export function analyzeWalletBehavior(input: WalletBehaviorInput): WalletBehaviorResult {
  const now = Date.now()
  const walletAgeDays = (now - input.creationTimestamp) / (1000 * 60 * 60 * 24)

  let score = 0
  const flags: string[] = []

  if (walletAgeDays < 3) {
    score += 30
    flags.push("🧪 New Wallet")
  }

  if (input.txCount24h > 50) {
    score += 25
    flags.push("⚡ High Activity")
  }

  if (input.avgTxValue > 5000) {
    score += 20
    flags.push("💰 High Value Tx")
  }

  if (input.distinctTokensInteracted > 10) {
    score += 15
    flags.push("🔀 Multi-Token Interactions")
  }

  const label =
    score > 70 ? "Suspicious"
    : score > 40 ? "Caution"
    : "Normal"

  return {
    label,
    score,
    flags
  }
}
