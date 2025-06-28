import React from "react"

interface TokenOverviewProps {
  name: string
  symbol: string
  price: number
  change24h: number
  liquidity: number
  holders: number
  confidenceScore?: number // 0–100
}

export const TokenOverviewPanel: React.FC<TokenOverviewProps> = ({
  name,
  symbol,
  price,
  change24h,
  liquidity,
  holders,
  confidenceScore = 76
}) => {
  const changeClass = change24h >= 0 ? "positive" : "negative"
  const arrow = change24h >= 0 ? "▲" : "▼"

  return (
    <div className="token-overview-panel">
      <div className="header">
        <h2>{name} <span>({symbol})</span></h2>
        <span className="price">${price.toFixed(4)}</span>
      </div>

      <ul className="metrics">
        <li className={changeClass}>
          24h Change: {arrow} {Math.abs(change24h).toFixed(2)}%
        </li>
        <li>
          Liquidity: ${liquidity.toLocaleString()}
        </li>
        <li>
          Holders: {holders.toLocaleString()}
        </li>
        <li>
          Confidence Score: {confidenceScore}/100
        </li>
      </ul>

      <div className="confidence-bar">
        <div
          className="bar-fill"
          style={{ width: `${confidenceScore}%`, backgroundColor: confidenceScore > 70 ? "#4caf50" : "#f44336" }}
        />
      </div>
    </div>
  )
}
