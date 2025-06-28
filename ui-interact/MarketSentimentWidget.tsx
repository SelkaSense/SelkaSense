import React from "react";

interface MarketSentimentWidgetProps {
  sentimentScore: number; // value from 0 to 100
  trend: "Bullish" | "Bearish" | "Neutral";
  dominantToken: string;
  totalVolume24h: number;
}

const getSentimentColor = (score: number) => {
  if (score >= 70) return "#4caf50";
  if (score >= 40) return "#ff9800";
  return "#f44336";
};

export const MarketSentimentWidget: React.FC<MarketSentimentWidgetProps> = ({
  sentimentScore,
  trend,
  dominantToken,
  totalVolume24h
}) => {
  return (
    <div className="market-sentiment-widget">
      <h3>Market Sentiment</h3>
      <div className="sentiment-info">
        <div className="score-circle" style={{
          backgroundColor: getSentimentColor(sentimentScore)
        }}>
          {sentimentScore}%
        </div>
        <ul className="sentiment-details">
          <li><strong>Trend:</strong> {trend}</li>
          <li><strong>Dominant Token:</strong> {dominantToken}</li>
          <li><strong>24h Volume:</strong> ${totalVolume24h.toLocaleString()}</li>
        </ul>
      </div>
    </div>
  );
};