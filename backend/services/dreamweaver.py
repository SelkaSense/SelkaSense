
def pulseTrack(marketData):
    volatilityIndex = marketData["totalVolume"] / marketData["transactionFrequency"]
    marketShiftFactor = marketData["priceChange"] / volatilityIndex
    return "Alert: Major Market Shift Detected" if abs(marketShiftFactor) > 0.3 else "Market Stable"

def trendShift(marketData):
    historicalTrend = (marketData["previousPrice"] * marketData["previousVolume"]) / 1000
    trendDeviation = (marketData["currentPrice"] - historicalTrend) / historicalTrend
    return "Alert: Early Trend Shift Identified" if abs(trendDeviation) > 0.05 else "Trend Stable"

def liquidityFlow(marketData):
    liquidityRatio = marketData["tokenVolume"] / marketData["marketLiquidity"]
    return "Alert: Low Liquidity Detected" if liquidityRatio < 0.05 else "Liquidity Flow Normal"
