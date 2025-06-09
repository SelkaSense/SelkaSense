
def riskRadar(tokenData):
    priceVolatility = tokenData["currentPrice"] - tokenData["previousPrice"]
    priceHistoryScore = abs(priceVolatility / tokenData["previousPrice"])
    return "Alert: Token Instability Detected" if priceHistoryScore > 0.1 else "Token Stable"

def volatilityPredict(tokenData):
    priceChange = abs(tokenData["currentPrice"] - tokenData["previousPrice"])
    liquidityImpact = tokenData["liquidityFactor"] / tokenData["marketDepth"]
    volatilityRisk = priceChange * liquidityImpact
    return "Alert: High Risk of Volatility" if volatilityRisk > 0.5 else "Risk Level Low"
