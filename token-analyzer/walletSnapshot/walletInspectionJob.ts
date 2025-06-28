import type { VaultResult } from "@/ai"
import type {
  GetWalletDetailsArgumentsType,
  GetWalletDetailsResultBodyType
} from "./types"

export async function inspectWallet(
  vault: Wallet,
  _: GetWalletDetailsArgumentsType
): Promise<VaultResult<GetWalletDetailsResultBodyType>> {
  try {
    const primaryAddress = await vault.getDefaultAddress()
    const addressId = primaryAddress.getId()
    const networkId = vault.getNetworkId()
    const vaultId = vault.getId()

    return {
      message: `✅ Wallet inspection successful`,
      body: {
        address: addressId,
        network: networkId,
        vaultId
      }
    }
  } catch (error: any) {
    return {
      message: `❌ Wallet inspection failed: ${error?.message || String(error)}`,
    }
  }
}