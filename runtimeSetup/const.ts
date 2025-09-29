/**
 * Core configuration constants for scanning, detection, and alerts
 * Deterministic values only — no randomness
 */

/* ----------------------------------------
   Scan intervals and lookback
---------------------------------------- */
export const DEFAULT_SCAN_INTERVAL_MS = 600_000 // 10 minutes
export const MAX_TX_LOOKBACK = 200 // max number of transactions to fetch per scan

/* ----------------------------------------
   Whale / liquidity thresholds
---------------------------------------- */
export const MIN_WHALE_THRESHOLD = 10_000 // token amount that counts as whale activity
export const MIN_TOKEN_LIQUIDITY = 5_000 // skip analysis below this liquidity floor

/* ----------------------------------------
   Risk scoring
---------------------------------------- */
export const FLASH_ACTIVITY_WINDOW_MS = 300_000 // 5 minutes burst detection window
export const RISK_SCORE_ALERT_THRESHOLD = 0.85  // trigger alert when score >= threshold

/* ----------------------------------------
   Alert channels
---------------------------------------- */
export const ALERT_CHANNELS = Object.freeze({
  whaleMoves: "alerts/whales",
  suspiciousTokens: "alerts/tokens",
  flashPumps: "alerts/flash",
})

/* ----------------------------------------
   Utility
---------------------------------------- */
export const ALL_THRESHOLDS = {
  scanInterval: DEFAULT_SCAN_INTERVAL_MS,
  maxTxLookback: MAX_TX_LOOKBACK,
  whaleThreshold: MIN_WHALE_THRESHOLD,
  liquidityFloor: MIN_TOKEN_LIQUIDITY,
  flashWindow: FLASH_ACTIVITY_WINDOW_MS,
  riskScoreThreshold: RISK_SCORE_ALERT_THRESHOLD,
}
