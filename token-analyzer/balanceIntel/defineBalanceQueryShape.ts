import { z } from "zod"

export const BalanceQuerySchema = z
  .object({
    assetId: z
      .string()
      .min(3, "Asset ID must be at least 3 characters")
      .max(64, "Asset ID cannot exceed 64 characters")
      .describe("Token mint address or symbol to fetch balance for (leave empty for all assets)")
      .optional(),
    includeMetadata: z
      .boolean()
      .default(false)
      .describe("Include token metadata (name, decimals, symbol) in the result"),
  })
  .strip()
  .describe("Schema for querying specific or all token balances via wallet")
