import { z } from "zod"

export const WalletInspectionSchema = z
  .object({
    verbose: z.boolean().optional().describe("Whether to include extended wallet details"),
    includeHistory: z.boolean().optional().describe("Include recent transaction history in inspection")
  })
  .strip()
  .describe("Schema to trigger wallet identity and activity inspection")
