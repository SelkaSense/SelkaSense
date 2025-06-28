import { Connection, PublicKey } from "@solana/web3.js"

interface NewTokenAccount {
  address: string
  owner: string
  createdAt: number
}

export async function scanNewTokenAccounts(
  connection: Connection,
  fromSlot: number,
  slotRange: number = 100
): Promise<NewTokenAccount[]> {
  const tokenProgramId = new PublicKey("")
  const newAccounts: NewTokenAccount[] = []

  try {
    const slots = await connection.getBlocks(fromSlot, fromSlot + slotRange)

    for (const slot of slots) {
      const block = await connection.getBlock(slot, {
        maxSupportedTransactionVersion: 0,
      })

      if (!block?.transactions?.length) continue

      for (const { transaction, meta } of block.transactions) {
        const instructions = transaction.message.instructions

        for (const ix of instructions) {
          if ("programId" in ix && ix.programId.equals(tokenProgramId)) {
            const parsed = (ix as any).parsed

            if (parsed?.type === "initializeAccount") {
              const address = parsed.info?.account
              const owner = parsed.info?.owner

              if (address && owner) {
                newAccounts.push({
                  address,
                  owner,
                  createdAt: (block.blockTime || Math.floor(Date.now() / 1000)) * 1000,
                })
              }
            }
          }
        }
      }
    }

    return newAccounts
  } catch (err) {
    console.error(`[scanNewTokenAccounts] Error while scanning blocks:`, err)
    return []
  }
}
