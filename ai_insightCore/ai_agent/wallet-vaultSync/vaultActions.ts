import { z } from "zod"
import {
  SOLANA_ALL_BALANCES_NAME,
  SOLANA_BALANCE_NAME,
  SOLANA_GET_TOKEN_ADDRESS_NAME,
  SOLANA_GET_WALLET_ADDRESS_NAME,
  SOLANA_TRANSFER_NAME
} from "@/selkasense/action-names"
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction
} from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createTransferInstruction
} from "@solana/spl-token"

/* ========= Types ========= */

export interface VaultActionResponse<T> {
  notice: string
  data?: T
}

export interface ExecutionContext {
  connection: Connection
  walletPubkey: PublicKey
  sendTransaction: (tx: Transaction) => Promise<string>
}

export interface VaultActionCore<S extends z.ZodTypeAny, R> {
  id: string
  summary: string
  input: S
  execute: (args: { payload: z.infer<S>; context: ExecutionContext }) => Promise<VaultActionResponse<R>>
}

type VaultAction = VaultActionCore<any, any>

/* ========= 1. Wallet address ========= */

export const getWalletAddressAction: VaultActionCore<
  z.ZodObject<{}>,
  { walletAddress: string }
> = {
  id: SOLANA_GET_WALLET_ADDRESS_NAME,
  summary: "Retrieve the current wallet address",
  input: z.object({}),
  execute: async ({ context }) => ({
    notice: "Wallet address retrieved",
    data: { walletAddress: context.walletPubkey.toBase58() }
  })
}

/* ========= 2. Single-token balance ========= */

export const getBalanceAction: VaultActionCore<
  z.ZodObject<{ mintAddress: z.ZodString }>,
  { balance: number }
> = {
  id: SOLANA_BALANCE_NAME,
  summary: "Fetch SOL or SPL token balance",
  input: z.object({ mintAddress: z.string() }),
  execute: async ({ payload, context }) => {
    const { mintAddress } = payload
    if (mintAddress === "SOL") {
      const lamports = await context.connection.getBalance(context.walletPubkey)
      return {
        notice: "SOL balance fetched",
        data: { balance: lamports / LAMPORTS_PER_SOL }
      }
    }

    const mint = new PublicKey(mintAddress)
    const ata = getAssociatedTokenAddressSync(mint, context.walletPubkey, false, TOKEN_PROGRAM_ID)
    const info = await context.connection.getParsedAccountInfo(ata)
    const ui =
      info.value?.data && "parsed" in info.value.data
        ? // @ts-ignore parsed info
          (info.value.data.parsed.info.tokenAmount.uiAmount as number)
        : 0

    return { notice: "Token balance fetched", data: { balance: ui } }
  }
}

/* ========= 3. All balances ========= */

export const getAllBalancesAction: VaultActionCore<
  z.ZodObject<{}>,
  { balances: Record<string, number> }
> = {
  id: SOLANA_ALL_BALANCES_NAME,
  summary: "Fetch SOL + all SPL token balances",
  input: z.object({}),
  execute: async ({ context }) => {
    const balances: Record<string, number> = {}

    // SOL
    const solLamports = await context.connection.getBalance(context.walletPubkey)
    balances.SOL = solLamports / LAMPORTS_PER_SOL

    // SPL
    const tokens = await context.connection.getParsedTokenAccountsByOwner(
      context.walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    )

    tokens.value.forEach(acc => {
      // @ts-ignore parsed info
      const { mint, tokenAmount } = acc.account.data.parsed.info
      balances[mint] = tokenAmount.uiAmount
    })

    return { notice: "All balances fetched", data: { balances } }
  }
}

/* ========= 4. Mint lookup ========= */

const TOKEN_MAP: Record<string, string> = {
  USDC: "Es9vMFrzaC1...",
  RAY: "4k3Dyjzvzp8..."
}

export const getTokenAddressAction: VaultActionCore<
  z.ZodObject<{ symbol: z.ZodString }>,
  { mintAddress: string }
> = {
  id: SOLANA_GET_TOKEN_ADDRESS_NAME,
  summary: "Resolve SPL token mint by symbol",
  input: z.object({ symbol: z.string() }),
  execute: async ({ payload }) => {
    const mint = TOKEN_MAP[payload.symbol.toUpperCase()]
    if (!mint) throw new Error(`Unknown token symbol: ${payload.symbol}`)
    return { notice: "Mint resolved", data: { mintAddress: mint } }
  }
}

/* ========= 5. Transfer ========= */

export const transferAction: VaultActionCore<
  z.ZodObject<{
    recipient: z.ZodString
    amount: z.ZodNumber
    mintAddress: z.ZodString
  }>,
  { txSignature: string }
> = {
  id: SOLANA_TRANSFER_NAME,
  summary: "Transfer SOL or SPL tokens",
  input: z.object({
    recipient: z.string(),
    amount: z.number().positive(),
    mintAddress: z.string()
  }),
  execute: async ({ payload, context }) => {
    const recipient = new PublicKey(payload.recipient)
    const tx = new Transaction()

    if (payload.mintAddress === "SOL") {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: context.walletPubkey,
          toPubkey: recipient,
          lamports: payload.amount * LAMPORTS_PER_SOL
        })
      )
    } else {
      const mint = new PublicKey(payload.mintAddress)
      const senderATA = getAssociatedTokenAddressSync(mint, context.walletPubkey)
      const recipientATA = getAssociatedTokenAddressSync(mint, recipient)

      tx.add(
        createTransferInstruction(
          senderATA,
          recipientATA,
          context.walletPubkey,
          payload.amount,
          [],
          TOKEN_PROGRAM_ID
        )
      )
    }

    const signature = await context.sendTransaction(tx)
    return { notice: "Transfer executed", data: { txSignature: signature } }
  }
}
