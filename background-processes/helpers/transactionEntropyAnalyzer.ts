import { PublicKey } from "@solana/web3.js"

interface EntropyReport {
  mint: string
  uniqueAddresses: number
  txEntropyScore: number
  verdict: "normal" | "fragmented" | "consolidated"
}

export async function analyzeTransactionEntropy(
  connection: any,
  mintAddress: string,
  txLimit: number = 300
): Promise<EntropyReport> {
  const mint = new PublicKey(mintAddress)
  const addressCounts: Record<string, number> = {}

  const signatures = await connection.getSignaturesForAddress(mint, { limit: txLimit })

  for (const sig of signatures) {
    const tx = await connection.getParsedTransaction(sig.signature)
    if (!tx) continue

    for (const ix of tx.transaction.message.instructions) {
      if ("parsed" in ix && ix.parsed?.info?.owner) {
        const addr = ix.parsed.info.owner
        addressCounts[addr] = (addressCounts[addr] || 0) + 1
      }
    }
  }

  const uniqueAddresses = Object.keys(addressCounts).length
  const totalTx = Object.values(addressCounts).reduce((a, b) => a + b, 0)
  const entropy = -Object.values(addressCounts)
    .map(count => count / totalTx)
    .reduce((acc, p) => acc + p * Math.log2(p), 0)

  const score = Math.round((entropy / Math.log2(uniqueAddresses || 1)) * 100)

  let verdict: "normal" | "fragmented" | "consolidated" = "normal"
  if (score < 30) verdict = "consolidated"
  else if (score > 75) verdict = "fragmented"

  return {
    mint: mint.toBase58(),
    uniqueAddresses,
    txEntropyScore: score,
    verdict
  }
}
