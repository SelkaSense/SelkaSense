# market_signals.py
from dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, Tuple


class SignalLevel(Enum):
    STABLE = auto()
    NOTICE = auto()
    ALERT = auto()


@dataclass
class MarketData:
    total_volume: float          # aggregate volume in base units
    transaction_frequency: int   # number of on-chain tx
    price_change: float          # % change (–1 … +1)
    previous_price: float        # last session close
    previous_volume: float       # last session volume
    current_price: float         # latest traded price
    token_volume: float          # volume for target token
    market_liquidity: float      # depth in quote currency


# ---- Tunable thresholds & helpers --------------------------------------------------------------

@dataclass(frozen=True)
class Thresholds:
    # Pulse / macro shift
    shift_factor_alert: float = 0.30
    min_volatility_index: float = 1e-6  # avoid div-by-zero

    # Trend deviation
    trend_deviation_alert: float = 0.05

    # Liquidity
    liq_alert_ratio: float = 0.05
    liq_notice_ratio: float = 0.10


def _signal_msg(level: SignalLevel, message: str) -> str:
    tag = {
        SignalLevel.ALERT: "ALERT",
        SignalLevel.NOTICE: "Notice",
        SignalLevel.STABLE: "OK",
    }[level]
    return f"[{tag}] {message}"


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


# ---- Extended (“_ex”) analyzers return structured info; string wrappers kept for BC ------------

def pulse_track_ex(data: MarketData, thr: Thresholds = Thresholds()) -> Tuple[SignalLevel, str, Dict[str, float]]:
    """
    Detect rapid macro shift via volume/frequency imbalance.
    Returns (level, message, context).
    """
    tf = max(0, int(data.transaction_frequency))
    if tf == 0:
        return SignalLevel.NOTICE, "no transactions observed", {"volatility_index": 0.0, "shift_factor": 0.0}

    vol_index = max(float(data.total_volume) / tf, thr.min_volatility_index)
    pct = _clamp(float(data.price_change), -1.0, 1.0)
    shift_factor = pct / vol_index

    if abs(shift_factor) > thr.shift_factor_alert:
        return (
            SignalLevel.ALERT,
            "major market shift detected",
            {"volatility_index": vol_index, "shift_factor": shift_factor},
        )
    return SignalLevel.STABLE, "market stable", {"volatility_index": vol_index, "shift_factor": shift_factor}


def trend_shift_ex(data: MarketData, thr: Thresholds = Thresholds()) -> Tuple[SignalLevel, str, Dict[str, float]]:
    """
    Flag early deviation from a historical baseline.
    Baseline keeps original intent (price * volume / 1000), with safe guards.
    """
    prev_price = max(0.0, float(data.previous_price))
    prev_vol = max(0.0, float(data.previous_volume))
    baseline = (prev_price * prev_vol) / 1000.0
    if baseline <= 0:
        # If baseline can’t be derived, fall back to previous_price or 1.0
        baseline = prev_price or 1.0

    current = float(data.current_price)
    deviation = (current - baseline) / baseline

    if abs(deviation) > thr.trend_deviation_alert:
        return SignalLevel.ALERT, "early trend shift identified", {"baseline": baseline, "deviation": deviation}
    return SignalLevel.STABLE, "trend stable", {"baseline": baseline, "deviation": deviation}


def liquidity_flow_ex(data: MarketData, thr: Thresholds = Thresholds()) -> Tuple[SignalLevel, str, Dict[str, float]]:
    """
    Spot liquidity shortages or unhealthy concentration.
    """
    liq = max(0.0, float(data.market_liquidity))
    tok_vol = max(0.0, float(data.token_volume))

    if liq == 0:
        return SignalLevel.ALERT, "zero market liquidity", {"ratio": float("inf")}

    ratio = tok_vol / liq
    if ratio < thr.liq_alert_ratio:
        return SignalLevel.ALERT, "low liquidity detected", {"ratio": ratio}
    if ratio < thr.liq_notice_ratio:
        return SignalLevel.NOTICE, "liquidity somewhat thin", {"ratio": ratio}
    return SignalLevel.STABLE, "liquidity normal", {"ratio": ratio}


# ---- Backward-compatible string-returning wrappers ---------------------------------------------

def pulse_track(data: MarketData) -> str:
    level, msg, _ctx = pulse_track_ex(data)
    return _signal_msg(level, msg)


def trend_shift(data: MarketData) -> str:
    level, msg, _ctx = trend_shift_ex(data)
    return _signal_msg(level, msg)


def liquidity_flow(data: MarketData) -> str:
    level, msg, _ctx = liquidity_flow_ex(data)
    return _signal_msg(level, msg)


# ---- Optional: aggregate a single highest-severity signal --------------------------------------

def aggregate_signal(data: MarketData, thr: Thresholds = Thresholds()) -> str:
    """
    Compute all three signals and return the highest-severity message.
    Severity order: ALERT > NOTICE > STABLE.
    """
    results = [pulse_track_ex(data, thr), trend_shift_ex(data, thr), liquidity_flow_ex(data, thr)]
    severity = {SignalLevel.ALERT: 2, SignalLevel.NOTICE: 1, SignalLevel.STABLE: 0}
    best = max(results, key=lambda r: severity[r[0]])
    return _signal_msg(best[0], best[1])
 
