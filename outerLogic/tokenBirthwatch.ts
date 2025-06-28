import { Connection, PublicKey } from "@solana/web3.js"

interface NewTokenEntry {
  mint: string
  creator: string
  slot: number
  timestamp: number
}

export async function monitorNewTokens(
  connection: Connection,
  startSlot: number,
  scanLimit: number = 100
): Promise<NewTokenEntry[]> {
  const SPL_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
  const recentBlocks = await connection.getBlocks(startSlot, startSlot + scanLimit).catch(() => [])

  const results: NewTokenEntry[] = []

  for (const slot of recentBlocks) {
    const block = await connection.getBlock(slot, { maxSupportedTransactionVersion: 0 }).catch(() => null)
    if (!block || !block.transactions) continue

    for (const tx of block.transactions) {
      for (const ix of tx.transaction.message.instructions) {
        if ("programId" in ix && ix.programId.equals(SPL_PROGRAM_ID)) {
          const parsed = (ix as any).parsed
          if (parsed?.type === "initializeMint") {
            results.push({
              mint: parsed.info.mint,
              creator: parsed.info.authority,
              slot,
              timestamp: (block.blockTime || Date.now() / 1000) * 1000
            })
          }
        }
      }
    }
  }

  return results
}
