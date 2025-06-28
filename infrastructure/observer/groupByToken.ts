import { Connection, PublicKey } from "@solana/web3.js"

interface TokenVelocityMetrics {
  mint: string
  timeframeMinutes: number
  txCount: number
  uniqueWallets: number
  velocityScore: number // 0–100
}

export async function monitorTokenVelocity(
  connection: Connection,
  mintAddress: string,
  timeframeMinutes = 60,
  activityThreshold = 50
): Promise<TokenVelocityMetrics> {
  const mint = new PublicKey(mintAddress)
  const currentTime = Math.floor(Date.now() / 1000)
  const since = currentTime - timeframeMinutes * 60

  const accounts = await connection.getParsedTokenAccountsByMint(mint)
  const walletSet = new Set<string>()
  let totalTxs = 0

  for (const acc of accounts.value) {
    const owner = acc.account.data.parsed.info.owner
    const tokenPubkey = new PublicKey(acc.pubkey)

    const signatures = await connection.getSignaturesForAddress(tokenPubkey, { limit: 20 })
    for (const sig of signatures) {
      if (!sig.blockTime || sig.blockTime < since) continue
      walletSet.add(owner)
      totalTxs++
    }
  }

  const uniqueWallets = walletSet.size

  const velocityScore = Math.min(100, totalTxs + uniqueWallets * 2 + (totalTxs > activityThreshold ? 20 : 0))

  return {
    mint: mintAddress,
    timeframeMinutes,
    txCount: totalTxs,
    uniqueWallets,
    velocityScore,
  }
}
