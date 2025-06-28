
type TokenHolding = {
  symbol: string
  amount: number
  priceUsd: number
}

type TokenDistribution = {
  symbol: string
  valueUsd: number
  percentage: number
}

/**
 * Calculates token distribution in a wallet by USD value.
 */
export function calculateTokenDistribution(holdings: TokenHolding[]): TokenDistribution[] {
  const totalValue = holdings.reduce((sum, token) => sum + token.amount * token.priceUsd, 0)

  if (totalValue === 0) {
    return holdings.map(t => ({
      symbol: t.symbol,
      valueUsd: 0,
      percentage: 0
    }))
  }

  return holdings.map(token => {
    const value = token.amount * token.priceUsd
    return {
      symbol: token.symbol,
      valueUsd: parseFloat(value.toFixed(2)),
      percentage: parseFloat(((value / totalValue) * 100).toFixed(2))
    }
  })
}