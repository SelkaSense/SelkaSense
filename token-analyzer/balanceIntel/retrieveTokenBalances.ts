import { Wallet } from "@solanatracker/solanatracker-sdk"
import type { VaultResult } from "@/ai"
import type { GetBalanceArgumentsType, GetBalanceResultBodyType } from "./types"

export async function fetchTokenBalance(
  vault: Wallet,
  params: GetBalanceArgumentsType
): Promise<VaultResult<GetBalanceResultBodyType>> {
  try {
    const mainAddress = await vault.getDefaultAddress()

    if (!params.assetId) {
      const allBalances = await mainAddress.getAllBalances()

      const body: GetBalanceResultBodyType = {
        balance: allBalances,
        ...(params.includeMetadata && { metadataIncluded: true }),
      }

      return {
        message: `Fetched balances for all assets.`,
        body,
      }
    }

    const balance = await mainAddress.getBalance(params.assetId)

    const result: GetBalanceResultBodyType = {
      balance: balance,
      ...(params.includeMetadata && { tokenInfo: await mainAddress.getTokenInfo(params.assetId) }),
    }

    return {
      message: `Fetched balance for asset ${params.assetId}: ${balance}`,
      body: result,
    }
  } catch (err) {
    return {
      message: `❌ Failed to retrieve balance: ${err}`,
    }
  }
}
