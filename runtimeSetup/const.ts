export const DEFAULT_SCAN_INTERVAL = 600_000  // 10 minutes in milliseconds
export const MAX_TX_LOOKBACK = 200           // Maximum number of transactions to look back
export const MIN_WHALE_THRESHOLD = 10_000     // Minimum token amount to consider as whale movement

// Additional thresholds and tuning values
export const FLASH_ACTIVITY_WINDOW_MS = 300_000   // 5 minutes window for burst detection
export const RISK_SCORE_ALERT_THRESHOLD = 0.85    // Trigger alerts if risk score exceeds this
export const MIN_TOKEN_LIQUIDITY = 5_000          // Skip tokens below this liquidity

export const ALERT_CHANNELS = {
  whaleMoves: "alerts/whales",
  suspiciousTokens: "alerts/tokens",
  flashPumps: "alerts/flash",
}