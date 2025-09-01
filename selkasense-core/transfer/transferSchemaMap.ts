import { z } from "zod"
import { Amount } from "@coinbase/coinbase-sdk"

/**
 * Schema for defining asset transfer instructions
 */
export const AssetTransferSchema = z
  .object({
    /** Amount of tokens to send */
    amount: z.custom<Amount>({
      message: "amount must be a valid Coinbase Amount object",
    }),
    /** ID of the asset to transfer */
    assetId: z.string().min(1, "assetId cannot be empty"),
    /** Recipient wallet address */
    destination: z.string().min(32, "destination must be a valid wallet address"),
    /** Execute the transfer without gas fee if supported */
    gasless: z.boolean().optional().default(false),
  })
  .strict()
  .describe("Schema for asset transfer instructions")

export type AssetTransfer = z.infer<typeof AssetTransferSchema>
