

from dataclasses import dataclass
from enum import Enum
from time import time
from typing import List


class PathStatus(Enum):
    NORMAL = "Normal Flow"
    OBSCURED = "Obscured Transaction Trail"
    SUSPICIOUS = "Suspicious Movement Detected"


class RiskLevel(Enum):
    STABLE = "Stable"
    WATCHLIST = "Watchlist"
    CRITICAL = "Immediate Risk Alert"


@dataclass
class ScanParams:
    # hop thresholds
    hop_obscured: int = 4
    hop_suspicious: int = 6
    proxy_suspicious: int = 2
    # on-chain activity thresholds
    density_watch: int = 150
    density_critical: int = 300
    token_age_limit: int = 5          # days
    recent_alert_limit: int = 2


def dark_track(path: List[str], cfg: ScanParams = ScanParams()) -> PathStatus:
    """Classify the opacity of a transaction path."""
    proxy_cnt = path.count("unknown_wallet")

    if len(path) >= cfg.hop_suspicious and proxy_cnt >= cfg.proxy_suspicious:
        return PathStatus.SUSPICIOUS
    if len(path) >= cfg.hop_obscured:
        return PathStatus.OBSCURED
    return PathStatus.NORMAL


def risk_alert(
    tx_density: float,
    token_age_days: int,
    recent_alerts: int,
    cfg: ScanParams = ScanParams(),
) -> RiskLevel:
    """Evaluate overall risk based on density, token creation age, and prior alerts."""
    if (
        tx_density > cfg.density_critical
        and token_age_days < cfg.token_age_limit
        and recent_alerts >= cfg.recent_alert_limit
    ):
        return RiskLevel.CRITICAL
    if tx_density > cfg.density_watch:
        return RiskLevel.WATCHLIST
    return RiskLevel.STABLE


def log_trace(event: str, meta: str) -> None:
    ts = int(time())
    print(f"[TRACE] {event} — {meta} @ {ts}")
