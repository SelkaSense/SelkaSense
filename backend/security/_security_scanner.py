from dataclasses import dataclass

# ---------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------

@dataclass
class TokenSnapshot:
    current_price: float      # latest trade price
    previous_price: float     # last session close
    liquidity_factor: float   # available depth for this token
    market_depth: float       # overall depth of the pool

# ---------------------------------------------------------------------
# Risk functions
# ---------------------------------------------------------------------

def risk_radar(token: TokenSnapshot) -> str:
    """Evaluate historical price deviation."""
    if token.previous_price == 0:
        return "Alert: insufficient price history"

    history_score = abs(token.current_price - token.previous_price) / token.previous_price
    return (
        "Alert: token instability detected"
        if history_score > 0.10
        else "Token stable"
    )

def volatility_predict(token: TokenSnapshot) -> str:
    """Forecast short-term volatility based on price move × liquidity impact."""
    price_delta = abs(token.current_price - token.previous_price)
    if token.market_depth == 0:
        return "Alert: market depth is zero"

    liquidity_impact = token.liquidity_factor / token.market_depth
    risk_index = price_delta * liquidity_impact

    return (
        "Alert: high risk of volatility"
        if risk_index > 0.5
        else "Risk level low"
    )
