import { scanNewTokenAccounts } from "../scanNewTokenAccounts"

export async function runTokenScannerJob(): Promise<void> {
  const startedAt = new Date().toISOString()
  console.log(`[TokenScanner] Job started at ${startedAt}`)

  try {
    const summary = await scanNewTokenAccounts()

    if (!summary || summary.totalScanned === 0) {
      console.log("[TokenScanner] No new token accounts found")
    } else {
      console.log(`[TokenScanner] Scan complete: ${JSON.stringify(summary, null, 2)}`)
    }
  } catch (err) {
    console.error("[TokenScanner] Failed to complete job:", err)
  } finally {
    const endedAt = new Date().toISOString()
    console.log(`[TokenScanner] Job ended at ${endedAt}`)
  }
}
