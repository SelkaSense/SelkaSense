export interface RiskInput {
  volumeChangeRatio: number      // 0–1
  flashloanDetected: boolean
  smartWalletDensity: number     // 0–1
  sybilOverlapScore: number      // 0–1
}

export enum RiskLabel {
  Low = "Low",
  Elevated = "Elevated",
  High = "High",
  Severe = "Severe"
}

const RISK_WEIGHTS = {
  volumeChange: 0.25,
  flashloanPresence: 0.35,
  smartWalletPresence: 0.2,
  sybilOverlap: 0.2
}

export function computeRiskScore(input: RiskInput): number {
  const {
    volumeChangeRatio,
    flashloanDetected,
    smartWalletDensity,
    sybilOverlapScore
  } = input

  const rawScore =
    volumeChangeRatio * RISK_WEIGHTS.volumeChange +
    (flashloanDetected ? 1 : 0) * RISK_WEIGHTS.flashloanPresence +
    smartWalletDensity * RISK_WEIGHTS.smartWalletPresence +
    sybilOverlapScore * RISK_WEIGHTS.sybilOverlap

  return Math.min(100, parseFloat((rawScore * 100).toFixed(1)))
}

export function mapScoreToLabel(score: number): RiskLabel {
  if (score >= 85) return RiskLabel.Severe
  if (score >= 60) return RiskLabel.High
  if (score >= 35) return RiskLabel.Elevated
  return RiskLabel.Low
}

export function describeRisk(label: RiskLabel): string {
  switch (label) {
    case RiskLabel.Severe:
      return "Severe on-chain activity — flag and monitor immediately"
    case RiskLabel.High:
      return "High risk detected — multiple anomalies present"
    case RiskLabel.Elevated:
      return "Elevated risk — patterns show potential red flags"
    case RiskLabel.Low:
      return "Low risk — on-chain activity appears stable"
  }
}
