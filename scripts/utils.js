export function formatNumber(n: number): string {
  if (typeof n !== "number" || isNaN(n)) return "N/A"

  const abs = Math.abs(n)

  if (abs >= 1e9) return (n / 1e9).toFixed(2) + "B"
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + "M"
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + "K"

  return n.toLocaleString()
}

export function isValidAddress(addr: string): boolean {
  return typeof addr === "string" &&
    addr.length === 44 &&
    /^[1-9A-HJ-NP-Za-km-z]+$/.test(addr)
}
