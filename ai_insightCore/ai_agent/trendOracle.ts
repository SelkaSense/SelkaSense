import type { Wallet } from "@solana/solana-sdk"
import type { CdpAction, CdpActionSchemaAny, CdpActionResult } from "./actions/cdp-action"
import type { VaultEngine } from "./engine-core"

type ActionRegistry = Map<string, CdpAction<CdpActionSchemaAny, unknown>>

/**
 * In-memory registry of all dynamically loadable actions
 */
const registry: ActionRegistry = new Map()

/**
 * Register a new action under a unique key
 */
export function registerAction<T extends CdpActionSchemaAny, R>(
  key: string,
  action: CdpAction<T, R>
): void {
  if (registry.has(key)) {
    throw new Error(`Action "${key}" already registered`)
  }
  registry.set(key, action)
}

/**
 * Resolve an action from the registry
 */
export function getAction(key: string): CdpAction<CdpActionSchemaAny, unknown> {
  const action = registry.get(key)
  if (!action) throw new Error(`Action "${key}" not found`)
  return action
}

/**
 * Execute an action by key using a VaultEngine instance
 */
export async function execActionByKey<R>(
  engine: VaultEngine,
  key: string,
  input: unknown
): Promise<CdpActionResult<R>> {
  const action = getAction(key)

  // Validate input against the action schema (if present)
  if (action.schema) {
    const result = action.schema.safeParse(input)
    if (!result.success) {
      return { message: "Validation failed", errors: result.error.issues }
    }
    input = result.data
  }

  // Decide if the action requires a wallet
  if (action.func.length > 1) {
    const wallet = a
