// tokenRiskEvaluator.ts

/* ------------ Types & enums ------------ */

export interface TokenMetrics {
  address: string
  liquidity: number
  volume24h: number
  holders: number
  priceChange24h: number
}

export enum RiskCategory {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export interface RiskResult {
  risk: RiskCategory
  volatility: number         // 0-100
}

/* ------------ Placeholder scoring helpers ------------ */

/** TODO: replace with real logic */
function riskRadar(metrics: TokenMetrics): RiskCategory {
  if (metrics.liquidity < 5_000 || metrics.priceChange24h < -30) return RiskCategory.High
  if (metrics.liquidity < 20_000) return RiskCategory.Medium
  return RiskCategory.Low
}

/** TODO: replace with AI volatility model */
function volatilityPredict(metrics: TokenMetrics): number {
  const score =
    Math.abs(metrics.priceChange24h) * 0.6 +
    (1 / Math.max(metrics.liquidity, 1)) * 50 +
    (metrics.volume24h / 10_000) * 0.2
  return Math.min(Math.round(score), 100)
}

/* ------------ Public API ------------ */

export function evaluateTokenRisk(metrics: TokenMetrics): RiskResult {
  return {
    risk: riskRadar(metrics),
    volatility: volatilityPredict(metrics),
  }
}

/* ------------ DOM helpers ------------ */

function gatherTokenInput(): TokenMetrics {
  return {
    address: (document.getElementById("token-address") as HTMLInputElement).value.trim(),
    liquidity: Number((document.getElementById("token-liquidity") as HTMLInputElement).value),
    volume24h: Number((document.getElementById("token-volume") as HTMLInputElement).value),
    holders: Number((document.getElementById("token-holders") as HTMLInputElement).value),
    priceChange24h: Number(
      (document.getElementById("token-price-change") as HTMLInputElement).value,
    ),
  }
}

function renderResult({ risk, volatility }: RiskResult): void {
  const out = document.getElementById("scan-output")
  if (!out) return
  out.textContent = `Risk: ${risk} | Volatility index: ${volatility}`
}

/* ------------ UI binding ------------ */

export function bindUIEvents(): void {
  const scanBtn = document.getElementById("scan-button")
  if (!scanBtn) return

  scanBtn.addEventListener("click", () => {
    try {
      const data = gatherTokenInput()
      const result = evaluateTokenRisk(data)
      renderResult(result)
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Input error: ${err}`)
    }
  })
}

/* Auto-init if script is loaded in browser */
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", bindUIEvents)
}
