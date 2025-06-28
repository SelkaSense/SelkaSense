import React from "react";

interface WhaleAlertCardProps {
  walletAddress: string;
  amountMoved: number;
  token: string;
  timestamp: number;
  network?: string;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncateAddress(addr: string): string {
  return addr && addr.length > 8
    ? `${addr.slice(0, 6)}...${addr.slice(-4)}`
    : addr;
}

export const WhaleAlertCard: React.FC<WhaleAlertCardProps> = ({
  walletAddress,
  amountMoved,
  token,
  timestamp,
  network = "Solana"
}) => {
  return (
    <div className="whale-alert-card" style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "16px",
      backgroundColor: "#fdfdfd",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      maxWidth: "380px",
      margin: "12px auto"
    }}>
      <h4 style={{ marginBottom: "8px", color: "#4e4e4e" }}>🐋 Whale Transfer Detected</h4>
      <p><strong>Wallet:</strong> {truncateAddress(walletAddress)}</p>
      <p><strong>Amount:</strong> {amountMoved.toLocaleString()} {token}</p>
      <p><strong>Network:</strong> {network}</p>
      <p><strong>Time:</strong> {formatTimeAgo(timestamp)}</p>
    </div>
  );
};
