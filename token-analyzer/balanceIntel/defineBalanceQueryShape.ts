import { z } from "zod"

/**
 * Schema for querying specific or all token balances via wallet
 */
export const BalanceQuerySchema = z
  .object({
    /** Token mint address or symbol to fetch balance for (omit to fetch all) */
    assetId: z
      .string()
      .regex(/^[a-zA-Z0-9]{3,64}$/, "assetId must be alphanumeric and 3–64 characters long")
      .optional(),
    /** Whether to include token metadata (name, decimals, symbol) */
    includeMetadata: z.boolean().optional().default(false),
  })
  .strict()
  .describe("Schema for balance queries")

export type BalanceQuery = z.infer<typeof BalanceQuerySchema>
