import React from "react"
import { TokenInsightCard } from "./TokenInsightCard"
import { RiskSignalBadge } from "./RiskSignalBadge"
import { WalletActivityGraph } from "./WalletActivityGraph"
import { WhaleTransferList } from "./WhaleTransferList"
import { AlertBanner } from "./AlertBanner"

const AnalyzerDashboard: React.FC = () => {
  const tokenData = {
    name: "SOLANA",
    riskLevel: "High",
    volume: 1543200,
  }

  const whaleTransfers = [
    { amount: 120000, token: "SOL", address: "FgkE9rW...7Pq2" },
    { amount: 88000, token: "SOL", address: "9kq3reP...Mwb1" },
  ]

  const walletActivity = [
    { time: "10:00", value: 400 },
    { time: "11:00", value: 850 },
    { time: "12:00", value: 300 },
  ]

  return (
    <div className="analyzer-dashboard">
      <AlertBanner message="Spike detected on SOL — 37.4% risk increase in last hour" />

      <section className="dashboard-section">
        <TokenInsightCard
          tokenName={tokenData.name}
          riskLevel={tokenData.riskLevel}
          volume={tokenData.volume}
        />
        <RiskSignalBadge level={tokenData.riskLevel} />
      </section>

      <section className="dashboard-section">
        <WalletActivityGraph data={walletActivity} />
        <WhaleTransferList transfers={whaleTransfers} />
      </section>
    </div>
  )
}

e
