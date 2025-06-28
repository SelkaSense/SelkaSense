import { z } from "zod"
import { Wallet } from "@sol/sol-sdk"
import { ActionCore, ActionResponse, GenericSchema } from "../../sol-action"

export type VaultSchema = GenericSchema
export type VaultResult<T> = ActionResponse<T>

export type VaultExecutor<T extends VaultSchema, R> =
  | ((wallet: Wallet, input: z.infer<T>) => Promise<VaultResult<R>>)
  | ((input: z.infer<T>) => Promise<VaultResult<R>>)

export interface VaultAction<T extends VaultSchema, R> extends ActionCore<T, R, Wallet> {
  execute?: VaultExecutor<T, R>
}
