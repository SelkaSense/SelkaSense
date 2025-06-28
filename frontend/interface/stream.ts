/**
 * Stream wallet addresses at a fixed cadence and emit a callback for each tick.
 *
 * @param wallets   array of wallet public keys
 * @param interval  delay between emissions (ms)
 * @param onTick    optional callback executed on each wallet
 * @returns function to stop the stream
 */
export function streamWalletFlow(
  wallets: string[],
  interval = 1000,
  onTick: (wallet: string, index: number) => void = () => {},
): () => void {
  let idx = 0

  const timer = setInterval(() => {
    if (idx >= wallets.length) {
      clearInterval(timer)
      return
    }
    const wallet = wallets[idx]
    // eslint-disable-next-line no-console
    console.log(`[stream] wallet ${idx + 1}/${wallets.length}:`, wallet)
    onTick(wallet, idx)
    idx += 1
  }, interval)

  /* Return a stopper function */
  return () => clearInterval(timer)
}
