// selkaSenseActions.ts

import { z } from "zod"

// Base schema for SelkaSense actions
export type SelkaSenseSchema = z.ZodObject<z.ZodRawShape>

// Standardized response for any action
export interface SelkaSenseActionResponse<T> {
  notice: string
  data?: T
}

// Core structure defining a SelkaSense action
export interface SelkaSenseActionCore<
  S extends SelkaSenseSchema,
  R,
  Ctx = unknown
> {
  id: string
  summary: string
  input: S
  execute: (
    args: {
      payload: z.infer<S>
      context: Ctx
    }
  ) => Promise<SelkaSenseActionResponse<R>>
}

// Union type covering any SelkaSense action
export type SelkaSenseAction = SelkaSenseActionCore<SelkaSenseSchema, unknown, unknown>

// Example: Define an auraRead action for SelkaSense
export const auraReadAction: SelkaSenseActionCore<
  z.ZodObject<{
    contractAddress: z.ZodString
    timeframeHours: z.ZodNumber
  }>,
  {
    auraIntensity: number
    decodedPatterns: string[]
  },
  {
    endpoint: string
    token: string
  }
> = {
  id: "auraRead",
  summary: "Run Selka aura pattern decoding on a target contract over a given timeframe",
  input: z.object({
    contractAddress: z.string(),
    timeframeHours: z.number().int().positive()
  }),
  execute: async ({ payload, context }) => {
    const { contractAddress, timeframeHours } = payload
    const { endpoint, token } = context

    const response = await fetch(
      `${endpoint}/selka/aura-scan?address=${encodeURIComponent(contractAddress)}&hours=${timeframeHours}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Selka API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return {
      notice: `Aura read complete for ${contractAddress}`,
      data: {
        auraIntensity: result.intensity,
        decodedPatterns: result.patterns as string[]
      }
    }
  }
}
