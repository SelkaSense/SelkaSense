export const PROJECT_NAME = "SelkaSense"

export interface AppConfig {
  projectName: string
  solanaRpcUrl: string
  anomalyFeedUrl: string
  tokenInsightService: string
  walletAuditEndpoint: string
  heartbeatUrl: string
}

export const config: AppConfig = {
  projectName: PROJECT_NAME,
  solanaRpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  anomalyFeedUrl: process.env.ANOMALY_FEED_URL || "https://selka.feed.core/stream",
  tokenInsightService: process.env.TOKEN_INSIGHT_SERVICE || "https://selka.core/api/insight",
  walletAuditEndpoint: process.env.WALLET_AUDIT_ENDPOINT || "https://selka.core/audit/wallet",
  heartbeatUrl: process.env.HEARTBEAT_URL || "https://selka.core/heartbeat"
}
