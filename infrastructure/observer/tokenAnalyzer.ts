import { Connection, PublicKey } from "@solana/web3.js"

interface PressureSignal {
  mint: string
  timeframeHours: number
  netFlow: number
  inflowAddresses: string[]
  outflowAddresses: string[]
  severity: "low" | "moderate" | "high"
}

export async function detectTokenPressure(
  connection: Connection,
  mintAddress: string,
  timeframeHours: number = 2,
  threshold: number = 10_000
): Promise<PressureSignal> {
  const mint = new PublicKey(mintAddress)
  const now = Math.floor(Date.now() / 1000)
  const since = now - timeframeHours * 3600

  const tokenAccounts = await connection.getParsedTokenAccountsByMint(mint)
  let netFlow = 0
  const inflowAddresses = new Set<string>()
  const outflowAddresses = new Set<string>()

  for (const { pubkey, account } of tokenAccounts.value) {
    const owner = account.data.parsed?.info?.owner
    const accountPubkey = new PublicKey(pubkey)

    try {
      const txs = await connection.getSignaturesForAddress(accountPubkey, { limit: 10 })

      for (const tx of txs) {
        if (!tx.blockTime || tx.blockTime < since || tx.confirmationStatus !== "confirmed") continue

        const parsedTx = await connection.getParsedTransaction(tx.signature, "confirmed")
        if (!parsedTx) continue

        for (const ix of parsedTx.transaction.message.instructions) {
          if ("parsed" in ix && ix.program === "spl-token" && ix.parsed?.type === "transfer") {
            const { amount, source, destination } = ix.parsed.info
            const amt = Number(amount)

            if (destination === pubkey.toString()) {
              netFlow += amt
              inflowAddresses.add(owner)
            } else if (source === pubkey.toString()) {
              netFlow -= amt
              outflowAddresses.add(owner)
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[TokenPressure] Skipped account ${pubkey.toString()} due to error:`, err)
    }
  }

  let severity: "low" | "moderate" | "high" = "low"
  const absFlow = Math.abs(netFlow)
  if (absFlow > threshold * 10) severity = "high"
  else if (absFlow > threshold) severity = "moderate"

  return {
    mint: mintAddress,
    timeframeHours,
    netFlow,
    inflowAddresses: [...inflowAddresses],
    outflowAddresses: [...outflowAddresses],
    severity
  }
}
