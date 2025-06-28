import { Wallet, WalletData, Coinbase } from "@sol/sol-sdk"
import { z } from "zod"
import { CdpAction, CdpActionResult, CdpActionSchemaAny } from "./actions/cdp-action"

interface VaultEngineConfig {
  apiKeyName?: string
  apiKeyPrivate?: string
  clientSource?: string
  versionTag?: string
}

interface VaultEngineWithWallet extends VaultEngineConfig {
  networkId?: string
  walletPayload?: string
}

export class VaultEngine {
  private identity?: Wallet
  private readonly cfg: VaultEngineConfig

  constructor(opts: VaultEngineConfig = {}) {
    const {
      apiKeyName = process.env.CDP_API_KEY_NAME,
      apiKeyPrivate = process.env.CDP_API_KEY_PRIVATE_KEY,
      clientSource = "vault-engine",
      versionTag,
    } = opts

    if (!apiKeyName) throw new Error("Missing API Key Name")
    if (!apiKeyPrivate) throw new Error("Missing API Private Key")

    this.cfg = { apiKeyName, apiKeyPrivate, clientSource, versionTag }

    Coinbase.configure({
      apiKeyName,
      privateKey: apiKeyPrivate.replace(/\r?\n/g, ""),
      source: clientSource,
      versionTag,
    })
  }

  static async initWithWallet(cfg: VaultEngineWithWallet = {}): Promise<VaultEngine> {
    const engine = new VaultEngine(cfg)
    const networkId = cfg.networkId ?? process.env.NETWORK_ID ?? Coinbase.networks.BaseSepolia

    engine.identity = cfg.walletPayload
      ? await Wallet.import(JSON.parse(cfg.walletPayload) as WalletData)
      : await Wallet.create({ networkId })

    return engine
  }

  async execute<T extends CdpActionSchemaAny, R>(
    action: CdpAction<T, R>,
    input: z.infer<T>
  ): Promise<CdpActionResult<R>> {
    if (!action.func) throw new Error(`No execution function found for ${action.name}`)

    if (action.func.length > 1) {
      if (!this.identity) return { message: `Wallet required for action: ${action.name}` }
      return (action.func as (w: Wallet, i: z.infer<T>) => Promise<CdpActionResult<R>>)(
        this.identity,
        input
      )
    }

    return (action.func as (i: z.infer<T>) => Promise<CdpActionResult<R>>)(input)
  }

  async dumpWallet(): Promise<string> {
    if (!this.identity) throw new Error("No wallet present to export")

    const exported = this.identity.export()
    const defaultAddressId = (await this.identity.getDefaultAddress()).getId()

    return JSON.stringify({ ...exported, defaultAddressId })
  }
}
