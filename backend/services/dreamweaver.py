# market_signals.py
from dataclasses import dataclass
from enum import Enum, auto


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


def _signal_msg(level: SignalLevel, message: str) -> str:
    tag = {
        SignalLevel.ALERT: "ALERT",
        SignalLevel.NOTICE: "Notice",
        SignalLevel.STABLE: "OK",
    }[level]
    return f"[{tag}] {message}"


def pulse_track(data: MarketData) -> str:
    """Detect rapid macro shift via volume / frequency imbalance."""
    if data.transaction_frequency == 0:
        return _signal_msg(SignalLevel.NOTICE, "no transactions observed")

    volatility_index = data.total_volume / data.transaction_frequency
    shift_factor = data.price_change / volatility_index

    if abs(shift_factor) > 0.3:
        return _signal_msg(SignalLevel.ALERT, "major market shift detected")
    return _signal_msg(SignalLevel.STABLE, "market stable")


def trend_shift(data: MarketData) -> str:
    """Flag early deviation from historical trend baseline."""
    baseline = (data.previous_price * data.previous_volume) / 1000 or 1
    deviation = (data.current_price - baseline) / baseline

    if abs(deviation) > 0.05:
        return _signal_msg(SignalLevel.ALERT, "early trend shift identified")
    return _signal_msg(SignalLevel.STABLE, "trend stable")


def liquidity_flow(data: MarketData) -> str:
    """Spot liquidity shortages or unhealthy concentration."""
    if data.market_liquidity == 0:
        return _signal_msg(SignalLevel.ALERT, "zero market liquidity")

    ratio = data.token_volume / data.market_liquidity
    if ratio < 0.05:
        return _signal_msg(SignalLevel.ALERT, "low liquidity detected")
    if ratio < 0.1:
        return _signal_msg(SignalLevel.NOTICE, "liquidity somewhat thin")
    return _signal_msg(SignalLevel.STABLE, "liquidity normal")
