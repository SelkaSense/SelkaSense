import { Connection, PublicKey, ParsedInstruction } from "@solana/web3.js"

interface SweepOptions {
  /** Minimum distinct recipients per sender to consider suspicious */
  minTransfers?: number
  /** How many recent slots to scan */
  scanDepth?: number
  /** Program ID to inspect (default: SPL Token program) */
  programId?: PublicKey
  /** Maximum number of concurrent block fetches */
  concurrency?: number
}

export interface SweepResult {
  token: string
  suspiciousSources: string[]
  sybilScore: number
}

/**
 * Scans recent Solana blocks for potential Sybil-like behavior on a given SPL token.
 */
export async function runSybilSweep(
  connection: Connection,
  mintAddress: string,
  opts: SweepOptions = {}
): Promise<SweepResult> {
  const {
    minTransfers = 4,
    scanDepth = 100,
    programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    concurrency = 5,
  } = opts

  const mintKey = new PublicKey(mintAddress)
  const latestSlot = await connection.getSlot()
  const senderMap = new Map<string, Set<string>>()

  // Helper to process a single block
  async function processSlot(slot: number) {
    try {
      const block = await connection.getBlock(slot, { maxSupportedTransactionVersion: 0 })
      if (!block?.transactions) return

      for (const tx of block.transactions) {
        for (const ix of tx.transaction.message.instructions as ParsedInstruction[]) {
          if (
            ix.programId.equals(programId) &&
            ix.parsed?.type === "transfer" &&
            ix.parsed.info.mint === mintKey.toBase58()
          ) {
            const { source, destination } = ix.parsed.info
            let recSet = senderMap.get(source)
            if (!recSet) {
              recSet = new Set()
              senderMap.set(source, recSet)
            }
            recSet.add(destination)
          }
        }
      }
    } catch {
      // ignore fetch errors or unsupported blocks
    }
  }

  // Batch slots into concurrent chunks
  const slots = Array.from({ length: scanDepth }, (_, i) => latestSlot - i)
  for (let i = 0; i < slots.length; i += concurrency) {
    await Promise.all(slots.slice(i, i + concurrency).map(processSlot))
  }

  // Identify suspicious senders
  const suspiciousSources: string[] = []
  let totalSuspiciousTransfers = 0
  for (const [sender, recipients] of senderMap.entries()) {
    if (recipients.size >= minTransfers) {
      suspiciousSources.push(sender)
      totalSuspiciousTransfers += recipients.size
    }
  }

  // Compute a simple Sybil risk score (0–100)
  const rawScore = suspiciousSources.length * minTransfers + totalSuspiciousTransfers * 0.5
  const sybilScore = Math.min(100, Math.floor(rawScore))

  return {
    token: mintKey.toBase58(),
    suspiciousSources,
    sybilScore,
  }
}
