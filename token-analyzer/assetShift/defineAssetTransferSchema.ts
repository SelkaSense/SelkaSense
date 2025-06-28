import { z } from "zod"
import { Amount } from "@sol/sol-sdk"

export const AssetTransferSchema = z
  .object({
    amount: z.custom<Amount>({
      message: "Amount must be a valid Amount type from the SDK"
    }).describe("The exact amount of the asset to transfer"),

    assetId: z.string()
      .min(3, "Asset ID must be at least 3 characters")
      .describe("The unique identifier (mint address or symbol) of the asset"),

    destination: z.string()
      .length(44, "Destination must be a valid Solana wallet address")
      .describe("The recipient’s Solana wallet address"),

    gasless: z.boolean()
      .optional()
      .default(false)
      .describe("Enable gasless transfer if supported by the network"),
  })
  .strict()
  .describe("Instruction set for initiating a token transfer on Solana")