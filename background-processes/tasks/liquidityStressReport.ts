import { Connection, PublicKey } from "@solana/web3.js"

interface SuspiciousToken {
  mint: string
  creator: string
  createdAt: number
  reason: string
}

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
const connection = new Connection(RPC_URL, "confirmed")

const MINT_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

export async function scanSuspiciousMints(limitSlots = 100): Promise<SuspiciousToken[]> {
  const currentSlot = await connection.getSlot()
  const mints: SuspiciousToken[] = []

  for (let slot = currentSlot - limitSlots; slot < currentSlot; slot++) {
    const block = await connection.getBlock(slot, { maxSupportedTransactionVersion: 0 }).catch(() => null)
    if (!block || !block.transactions) continue

    for (const tx of block.transactions) {
      for (const ix of tx.transaction.message.instructions) {
        if ("programId" in ix && ix.programId.equals(MINT_PROGRAM)) {
          const parsed = (ix as any).parsed
          if (parsed?.type === "initializeMint") {
            const mintAddress = parsed.info.mint
            const decimals = parsed.info.decimals
            const authority = parsed.info.mintAuthority

            if (decimals === 0 || decimals === 9 || !parsed.info.freezeAuthority) {
              mints.push({
                mint: mintAddress,
                creator: authority,
                createdAt: block.blockTime ? block.blockTime * 1000 : Date.now(),
                reason: `Unusual mint config (decimals: ${decimals})`
              })
            }
          }
        }
      }
    }
  }

  return mints
}

export async function monitorAndLogSuspiciousTokens() {
  const suspicious = await scanSuspiciousMints()
  if (suspicious.length === 0) {
    console.log("[MintMonitor] No suspicious tokens found.")
    return
  }

  console.log(`[MintMonitor] Found ${suspicious.length} suspicious tokens:`)
  for (const token of suspicious) {
    const date = new Date(token.createdAt).toISOString()
    console.log(` • ${token.mint} by ${token.creator} at ${date} — ${token.reason}`)
  }
}

if (require.main === module) {
  monitorAndLogSuspiciousTokens()
    .catch(err => console.error("[MintMonitor] Error:", err))
}
