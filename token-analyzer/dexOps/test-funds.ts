import { Wallet } from "@solana/solana-sdk"
import { RequestFaucetFundsArgumentsType, RequestFaucetFundsActionResultType } from "./types"

/**
 * Handles requesting testnet tokens from a faucet for the provided asset.
 * Supports fallback to SOL if no specific assetId is provided.
 */
export async function acquireTestFunds(
  userWallet: Wallet,
  params: RequestFaucetFundsArgumentsType
): Promise<RequestFaucetFundsActionResultType> {
  const requestedAsset = params.assetId || "SOL"

  try {
    const tx = await userWallet.faucet(params.assetId || undefined)
    const confirmation = await tx.wait()

    const txLink = confirmation.getTransactionLink?.() || "No link available"

    return {
      message: `✅ Test tokens (${requestedAsset}) successfully received.\n🔗 View transaction: ${txLink}`,
      body: {
        transactionLink: txLink,
      },
    }
  } catch (err: any) {
    const errorMsg = typeof err === "string" ? err : err?.message || "Unknown error"
    return {
      message: `❌ Faucet request failed for ${requestedAsset}: ${errorMsg}`,
    }
  }
}
