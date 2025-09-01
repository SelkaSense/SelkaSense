import { scanNewTokenAccounts } from "../scanNewTokenAccounts"

export async function runTokenScannerJob(): Promise<void> {
  const startedAt = new Date()
  console.log(`[TokenScanner] 🚀 Job started at ${startedAt.toISOString()}`)

  try {
    const summary = await scanNewTokenAccounts()

    if (!summary) {
      console.warn("[TokenScanner] ⚠️ Scanner returned no summary object")
    } else if (summary.totalScanned === 0) {
      console.log("[TokenScanner] ℹ️ No new token accounts found")
    } else {
      console.log("[TokenScanner] ✅ Scan complete:")
      console.table(summary)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[TokenScanner] ❌ Failed to complete job:", message)
  } finally {
    const endedAt = new Date()
    const duration = (endedAt.getTime() - startedAt.getTime()) / 1000
    console.log(
      `[TokenScanner] 🛑 Job ended at ${endedAt.toISOString()} (duration: ${duration}s)`
    )
  }
}
