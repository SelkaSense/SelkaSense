from dataclasses import dataclass
from typing import Tuple, Dict

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
# Risk evaluation functions
# ---------------------------------------------------------------------

def risk_radar(
    token: TokenSnapshot,
    instability_threshold: float = 0.10
) -> Dict[str, float or str]:
    """
    Evaluate historical price deviation.
    Returns a dict with:
      - score: relative price change
      - status: message describing stability
    """
    if token.previous_price <= 0:
        return {"score": 0.0, "status": "Alert: insufficient price history"}

    score = abs(token.current_price - token.previous_price) / token.previous_price
    status = (
        "Alert: token instability detected"
        if score > instability_threshold
        else "Token stable"
    )
    return {"score": score, "status": status}


def volatility_predict(
    token: TokenSnapshot,
    volatility_threshold: float = 0.5
) -> Dict[str, float or str]:
    """
    Forecast short-term volatility based on price move × liquidity impact.
    Returns a dict with:
      - index: computed volatility index
      - status: message describing risk level
    """
    price_delta = abs(token.current_price - token.previous_price)
    if token.market_depth <= 0:
        return {"index": 0.0, "status": "Alert: market depth is zero"}

    liquidity_impact = token.liquidity_factor / token.market_depth
    index = price_delta * liquidity_impact
    status = (
        "Alert: high risk of volatility"
        if index > volatility_threshold
        else "Risk level low"
    )
    return {"index": index, "status": status}


def evaluate_token_risk(
    token: TokenSnapshot,
    instability_threshold: float = 0.10,
    volatility_threshold: float = 0.5
) -> Dict[str, Dict[str, float or str]]:
    """
    Run both risk_radar and volatility_predict, returning a combined report.
    """
    radar = risk_radar(token, instability_threshold)
    vol = volatility_predict(token, volatility_threshold)
    return {
        "historical_deviation": radar,
        "volatility_forecast": vol
    }
