import { Connection, PublicKey, Commitment } from "@solana/web3.js"

/** Callback fired on any account update */
export type AccountCallback = (data: Buffer, slot: number) => void

/**
 * Lightweight WebSocket monitor for Solana accounts.
 * – allows multiple listeners per address
 * – supports different commitment levels
 * – auto-cleans up on shutdown
 */
export class TransactionMonitor {
  private readonly connection: Connection
  private readonly listeners: Map<string, number[]> = new Map()

  constructor(
    rpcUrl: string,
    wsUrl?: string,
    private readonly defaultCommitment: Commitment = "confirmed"
  ) {
    this.connection = new Connection(rpcUrl, { wsEndpoint: wsUrl, commitment: defaultCommitment })
  }

  /** Subscribe to on-chain changes of a given account */
  async subscribeAccount(
    address: string,
    callback: AccountCallback,
    commitment: Commitment = this.defaultCommitment
  ): Promise<number> {
    const pubkey = new PublicKey(address)

    const listenerId = await this.connection.onAccountChange(
      pubkey,
      (info, ctx) => callback(info.data, ctx.slot),
      commitment
    )

    const ids = this.listeners.get(address) ?? []
    ids.push(listenerId)
    this.listeners.set(address, ids)

    return listenerId
  }

  /** Unsubscribe a specific listener or **all** listeners for an address */
  async unsubscribeAccount(address: string, listenerId?: number): Promise<boolean> {
    const ids = this.listeners.get(address)
    if (!ids || ids.length === 0) return false

    const targets = listenerId ? ids.filter(id => id === listenerId) : ids

    await Promise.all(
      targets.map(id => this.connection.removeAccountChangeListener(id).catch(() => {}))
    )

    this.listeners.set(
      address,
      listenerId ? ids.filter(id => id !== listenerId) : []
    )

    return true
  }

  /** Gracefully close every listener and the underlying connection */
  async shutdown(): Promise<void> {
    const allIds = Array.from(this.listeners.values()).flat()
    await Promise.all(
      allIds.map(id => this.connection.removeAccountChangeListener(id).catch(() => {}))
    )
    this.listeners.clear()
    await this.connection.close()
  }
}
