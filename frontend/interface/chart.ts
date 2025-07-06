/**
 * Render a configurable text-based risk “heat map” from an array of scores.
 *
 *  • 0.0–0.5   → 🟢  (low risk)
 *  • 0.5–0.8   → 🟠  (medium risk)
 *  • 0.8–1.0   → 🔴  (high risk)
 *
 * @param scores   Array of numeric scores (0.0–1.0)
 * @param options.cols        Number of columns per row (default: 16)
 * @param options.delimiter   Separator between symbols (default: ' ')
 * @param options.symbols     Custom symbols mapping for each risk tier
 * @param options.showAxis    If true, prefixes each row with its row index
 * @returns A multiline string representing the heat map
 */
export function renderRiskChart(
  scores: number[],
  options: {
    cols?: number
    delimiter?: string
    symbols?: { low: string; medium: string; high: string }
    showAxis?: boolean
  } = {}
): string {
  const {
    cols = 16,
    delimiter = " ",
    symbols = { low: "🟢", medium: "🟠", high: "🔴" },
    showAxis = false,
  } = options

  // Helper to clamp and map a value to its symbol
  const mapToSymbol = (v: number): string => {
    if (!Number.isFinite(v) || v < 0) v = 0
    if (v >= 0.8) return symbols.high
    if (v >= 0.5) return symbols.medium
    return symbols.low
  }

  const lines: string[] = []
  const totalRows = Math.ceil(scores.length / cols)

  for (let row = 0; row < totalRows; row++) {
    const start = row * cols
    const chunk = scores.slice(start, start + cols)
    const mapped = chunk.map(mapToSymbol).join(delimiter)
    const prefix = showAxis ? `${row.toString().padStart(2, "0")}: ` : ""
    lines.push(prefix + mapped)
  }

  return lines.join("\n")
}

/* Quick demo when run in Node */
if (require.main === module) {
  const data = Array.from({ length: 48 }, () => Math.random())
  console.log(
    renderRiskChart(data, {
      cols: 12,
      showAxis: true,
      symbols: { low: "·", medium: "•", high: "●" }
    })
  )
}
