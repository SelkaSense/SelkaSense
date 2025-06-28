import { z } from "zod"

import type { VaultResult } from "../vault-action"
import type { AssetTransferSchema } from "./asset-transfer-schema"

/**
 * Base Zod schema type for asset transfer action
 */
export type AssetTransferType = typeof AssetTransferSchema

/**
 * Inferred argument structure from asset transfer schema
 */
export type AssetTransferArgs = z.infer<AssetTransferType>

/**
 * Structure representing a successful transfer result
 */
export type TransferPayload = {
  transactionHash: string
  symbol: string
}
