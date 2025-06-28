import { Wallet } from "@sol/sol-sdk"
import type { TransferArgumentsType, TransferActionResultType } from "./types"

/**
 * Initiates a token transfer using a Solana wallet.
 * Handles gasless mode and validates transaction results.
 */
export async function initiateTransfer(
  sender: Wallet,
  params: TransferArgumentsType
): Promise<TransferActionResultType> {
  try {
    // Validate destination address
    if (!params.destination || params.destination.length !== 44) {
      throw new Error("Invalid destination address")
    }

    // Attempt to create the transfer
    const response = await sender.createTransfer({
      amount: params.amount,
      assetId: params.assetId,
      destination: params.destination,
      gasless: !!params.gasless
    })

    // Await transaction confirmation
    const confirmation = await response.wait()
    const tx = confirmation.getTransaction()

    if (!tx) {
      throw new Error("Transaction confirmation failed: no transaction object")
    }

    const hash = tx.getTransactionHash()
    if (!hash) {
      throw new Error("Transaction hash not found in response")
    }

    return {
      message: `✅ Sent ${params.amount} ${params.assetId} to ${params.destination}\n🔗 Hash: ${hash}\n🌐 View: ${tx.getTransactionLink()}`
