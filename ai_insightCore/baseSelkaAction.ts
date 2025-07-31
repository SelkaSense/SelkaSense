// selkaSenseActions.ts

import { z } from "zod"

// Base schema type for SelkaSense actions
export type SelkaSenseSchema = z.ZodTypeAny

// Standardized action response
export interface SelkaSenseActionResponse<T> {
  notice: string
  data?: T
}

// Core definition of a SelkaSense action
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

// Union of all actions
export type SelkaSenseAction = SelkaSenseActionCore<SelkaSenseSchema, unknown, unknown>

// Example action: perform an aura read scan
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
  summary: "Decode aura patterns on a contract over a timeframe",
  input: z.object({
    contractAddress: z.string().min(1),
    timeframeHours: z.number().int().positive()
  }),
  execute: async ({ payload, context }) => {
    // Validate context
    if (!context.endpoint || !context.token) {
      throw new Error("Missing context: endpoint and token are required")
    }

    // Destructure payload
    const { contractAddress, timeframeHours } = payload
    const url = `${context.endpoint.replace(/\/$/, "")}/selka/aura-scan`
    const params = new URLSearchParams({
      address: contractAddress,
      hours: String(timeframeHours),
    }).toString()

    try {
      const resp = await fetch(`${url}?${params}`, {
        headers: {
          "Authorization": `Bearer ${context.token}`,
          "Content-Type": "application/json"
        }
      })

      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(`API error (${resp.status}): ${text}`)
      }

      const json = await resp.json()
      return {
        notice: `Aura scan complete for ${contractAddress}`,
        data: {
          auraIntensity: Number(json.intensity) || 0,
          decodedPatterns: Array.isArray(json.patterns) ? json.patterns.map(String) : []
        }
      }

    } catch (err: any) {
      throw new Error(`Failed to execute auraReadAction: ${err.message}`)
    }
  }
}
