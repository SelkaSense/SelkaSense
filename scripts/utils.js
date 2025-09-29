/**
 * Utility functions for number formatting and address validation
 */

/* ----------------------------------------
   Number formatting
---------------------------------------- */

/**
 * Format large numbers into human-readable strings.
 * Supports billions, millions, thousands, and locale fallback.
 */
export function formatNumber(n: number, opts: { fixed?: number } = {}): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "N/A"

  const abs = Math.abs(n)

  if (abs >= 1e12) return (n / 1e12).toFixed(opts.fixed ?? 2) + "T"
  if (abs >= 1e9) return (n / 1e9).toFixed(opts.fixed ?? 2) + "B"
  if (abs >= 1e6) return (n / 1e6).toFixed(opts.fixed ?? 2) + "M"
  if (abs >= 1e3) return (n / 1e3).toFixed(opts.fixed ?? 1) + "K"

  // for small numbers, keep locale formatting with full precision
  return n.toLocaleString(undefined, { maximumFractionDigits: opts.fixed ?? 6 })
}

/**
 * Format a number as a percentage string
 */
export function formatPercent(value: number, decimals = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A"
  return (value * 100).toFixed(decimals) + "%"
}

/* ----------------------------------------
   Address validation
---------------------------------------- */

/**
 * Validate whether a string is a plausible Solana address
 * - length exactly 44
 * - base58 alphabet (no 0, O, I, l)
 */
export function isValidAddress(addr: string): boolean {
  return (
    typeof addr === "string" &&
    addr.length === 44 &&
    /^[1-9A-HJ-NP-Za-km-z]+$/.test(addr)
  )
}

/**
 * Mask an address for display (first 4 and last 4 chars shown)
 */
export function maskAddress(addr: string, visible = 4): string {
  if (!isValidAddress(addr)) return "Invalid address"
  const start = addr.slice(0, visible)
  const end = addr.slice(-visible)
  return `${start}…${end}`
}
