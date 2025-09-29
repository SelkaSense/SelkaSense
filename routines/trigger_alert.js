/**
 * Log an alert message based on assessed risk level.
 * Adds timestamp and color-coded console output for readability.
 */

export type RiskLevel = "high" | "medium" | "low"

export interface TriggerAlertOptions {
  /** Optional override console prefix */
  prefix?: string
  /** Optional channel mapping for routing alerts elsewhere */
  channelMap?: Record<RiskLevel, string>
  /** Include timestamp (default true) */
  withTimestamp?: boolean
}

export function triggerAlert(
  riskLevel: RiskLevel,
  message: string,
  opts: TriggerAlertOptions = {}
): void {
  const { prefix, channelMap, withTimestamp = true } = opts

  const ts = withTimestamp ? `[${new Date().toISOString()}] ` : ""
  const channel = channelMap?.[riskLevel] ? `[${channelMap[riskLevel]}] ` : ""

  const finalMsg = `${ts}${prefix ?? ""}${channel}${message}`

  switch (riskLevel) {
    case "high":
      console.warn(`%c[ALERT: HIGH RISK]`, "color: red; font-weight: bold;", finalMsg)
      break
    case "medium":
      console.info(`%c[Alert: Medium risk]`, "color: orange; font-weight: bold;", finalMsg)
      break
    default:
      console.log(`%c[Info: Low risk]`, "color: gray;", finalMsg)
  }
}
