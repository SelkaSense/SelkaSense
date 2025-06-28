import { Connection, PublicKey } from "@solana/web3.js"

interface SweepResult {
  token: string
  suspiciousSources: string[]
  sybilScore: number
}

export async function runSybilSweep(
  connection: Connection,
  mintAddress: string,
  minTransfers = 4
): Promise<SweepResult> {
  const mint = new PublicKey(mintAddress)
  const programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
  const latestSlot = await connection.getSlot()
  const suspiciousSources = new Set<string>()
  let totalSuspicious = 0

  for (let i = 0; i < 100; i++) {
    const slot = latestSlot - i
    const block = await connection.getBlock(slot, { maxSupportedTransactionVersion: 0 }).catch(() => null)
    if (!block?.transactions) continue

    const senderMap = new Map<string, Set<string>>()

    for (const tx of block.transactions) {
      for (const ix of tx.transaction.message.instructions) {
        if ("parsed" in ix && ix.programId.equals(programId) && ix.parsed?.type === "transfer") {
          const parsed = ix.parsed.info
          if (parsed.mint !== mint.toBase58()) continue

          const sender = parsed.source
          const recipient = parsed.destination

          if (!senderMap.has(sender)) senderMap.set(sender, new Set())
          senderMap.get(sender)?.add(recipient)
        }
      }
    }

    for (const [sender, recipients] of senderMap.entries()) {
      if (recipients.size >= minTransfers) {
        suspiciousSources.add(sender)
        totalSuspicious += recipients.size
      }
    }
  }

  const score = Math.min(100, suspiciousSources.size * 10 + totalSuspicious * 0.5)

  return {
    token: mint.toBase58(),
    suspiciousSources: Array.from(suspiciousSources),
    sybilScore: score
  }
}
