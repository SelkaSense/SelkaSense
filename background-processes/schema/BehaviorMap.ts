import { Connection, PublicKey } from "@solana/web3.js"

interface TokenAnomalyReport {
  token: string
  abnormalTxCount: number
  recentVolume: number
  flaggedAddresses: string[]
  riskLevel: "low" | "moderate" | "high"
}

export async function generateTokenAnomalyProfile(
  connection: Connection,
  tokenMint: string,
  txThreshold = 50,
  volumeThreshold = 10000
): Promise<TokenAnomalyReport> {
  const mint = new PublicKey(tokenMint)
  const tokenAccounts = await connection.getParsedTokenAccountsByMint(mint)

  let totalVolume = 0
  let txCount = 0
  const addresses = new Set<string>()

  for (const { pubkey } of tokenAccounts.value) {
    const txs = await connection.getConfirmedSignaturesForAddress2(pubkey, { limit: 15 })
    txCount += txs.length

    for (const tx of txs) {
      const txDetails = await connection.getParsedTransaction(tx.signature)
      if (!txDetails) continue

      for (const ix of txDetails.transaction.message.instructions) {
        if ("parsed" in ix && ix.program === "spl-token" && ix.parsed?.type === "transfer") {
          const amt = parseInt(ix.parsed.info.amount)
          totalVolume += amt
          addresses.add(ix.parsed.info.source)
        }
      }
    }
  }

  const level: "low" | "moderate" | "high" =
    txCount > txThreshold && totalVolume > volumeThreshold * 2
      ? "high"
      : txCount > txThreshold || totalVolume > volumeThreshold
      ? "moderate"
      : "low"

  return {
    token: tokenMint,
    abnormalTxCount: txCount,
    recentVolume: totalVolume,
    flaggedAddresses: Array.from(addresses),
    riskLevel: level
  }
}
