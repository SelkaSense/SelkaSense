/**
 * Log an alert message based on assessed risk level.
 *
 * @param riskLevel  "high" | "medium" | "low"
 * @param message    human-readable alert text
 */
export function triggerAlert(riskLevel: "high" | "medium" | "low", message: string): void {
  switch (riskLevel) {
    case "high":
      console.warn("[ALERT: HIGH RISK]", message)
      break

    case "medium":
      console.info("[Alert: Medium risk]", message)
      break

    default:
      console.log("[Info: Low risk]", message)
  }
}
