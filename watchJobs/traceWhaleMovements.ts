import { traceTokenDistribution } from "../routines/background-jobs/token-flow/traceTokenDistribution"

export async function runWhaleDistributionCheck(): Promise<void> {
  const startedAt = new Date().toISOString()
  console.log(`[WhaleCheck] Distribution check started at ${startedAt}`)

  try {
    const result = await traceTokenDistribution()

    if (!result || Object.keys(result).length === 0) {
      console.log("[WhaleCheck] No whale distribution patterns detected.")
    } else {
      console.log(`[WhaleCheck] Whale distribution detected:\n${JSON.stringify(result, null, 2)}`)
    }
  } catch (err) {
    console.error("[WhaleCheck] Error while tracing distribution:", err)
  } finally {
    const endedAt = new Date().toISOString()
    console.log(`[WhaleCheck] Check completed at ${endedAt}`)
  }
}
