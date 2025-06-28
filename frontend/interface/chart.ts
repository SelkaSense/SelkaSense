/**
 * Render a simple text-based risk “heat map” from an array of scores.
 *
 *  • 0.0–0.5   → 🟢  (low risk)
 *  • 0.5–0.8   → 🟠  (medium risk)
 *  • 0.8–1.0   → 🔴  (high risk)
 *
 * Optionally include row/column breaks for readability.
 */
export function renderRiskChart(
  scores: number[],
  cols = 16,                // wrap every N entries
): string {
  const symbols = scores.map((v) => {
    if (v >= 0.8) return "🔴"
    if (v >= 0.5) return "🟠"
    return "🟢"
  })

  /* Add line breaks for grid layout */
  const lines: string[] = []
  for (let i = 0; i < symbols.length; i += cols) {
    lines.push(symbols.slice(i, i + cols).join(" "))
  }

  return lines.join("\n")
}

/* Quick demo when run in Node */
if (require.main === module) {
  const data = Array.from({ length: 48 }, () => Math.random())
  console.log(renderRiskChart(data))
}
