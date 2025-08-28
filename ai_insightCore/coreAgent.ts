// config.ts
import { z } from "zod"

export const PROJECT_NAME = "SelkaSense" as const

// ---- helpers ----
const trimTrailingSlashes = (u: string) => u.replace(/\/+$/, "")
const env = (k: string) => process.env[k]

/** Strict https? -> keep http allowed for local dev */
const urlSchema = z
  .string()
  .url()
  .transform((u) => trimTrailingSlashes(u))

/** Validate and normalize the app config */
const AppConfigSchema = z.object({
  projectName: z.string().min(1).default(PROJECT_NAME),
  solanaRpcUrl: urlSchema.default("https://api.mainnet-beta.solana.com"),
  anomalyFeedUrl: urlSchema.default("https://selka.feed.core/stream"),
  tokenInsightService: urlSchema.default("https://selka.core/api/insight"),
  walletAuditEndpoint: urlSchema.default("https://selka.core/audit/wallet"),
  heartbeatUrl: urlSchema.default("https://selka.core/heartbeat"),
})

export type AppConfig = z.infer<typeof AppConfigSchema>

// ---- construction ----
/**
 * Build a validated config from environment variables and optional overrides.
 * Trailing slashes are removed from URLs for consistency.
 */
export function createConfig(overrides: Partial<AppConfig> = {}): Readonly<AppConfig> {
  const raw = {
    projectName: overrides.projectName ?? PROJECT_NAME,
    solanaRpcUrl: overrides.solanaRpcUrl ?? env("SOLANA_RPC_URL") ?? "https://api.mainnet-beta.solana.com",
    anomalyFeedUrl: overrides.anomalyFeedUrl ?? env("ANOMALY_FEED_URL") ?? "https://selka.feed.core/stream",
    tokenInsightService: overrides.tokenInsightService ?? env("TOKEN_INSIGHT_SERVICE") ?? "https://selka.core/api/insight",
    walletAuditEndpoint: overrides.walletAuditEndpoint ?? env("WALLET_AUDIT_ENDPOINT") ?? "https://selka.core/audit/wallet",
    heartbeatUrl: overrides.heartbeatUrl ?? env("HEARTBEAT_URL") ?? "https://selka.core/heartbeat",
  }

  const parsed = AppConfigSchema.safeParse(raw)
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ")
    throw new Error(`Invalid AppConfig: ${issues}`)
  }
  return Object.freeze(parsed.data)
}

/** Eager, validated singleton config (keeps original export name for compatibility) */
export const config: Readonly<AppConfig> = createConfig()

// Optional: tiny helper to print a concise summary (no secrets)
export function printConfigSummary(): void {
  const c = config
  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify(
      {
        projectName: c.projectName,
        solanaRpcUrl: c.solanaRpcUrl,
        anomalyFeedUrl: c.anomalyFeedUrl,
        tokenInsightService: c.tokenInsightService,
        walletAuditEndpoint: c.walletAuditEndpoint,
        heartbeatUrl: c.heartbeatUrl,
      },
      null,
      2
    )
  )
}
