
from dataclasses import dataclass
from enum import Enum, auto
from time import time
from typing import List


class FlowStatus(Enum):
    NORMAL = "Normal Flow"
    OBSCURED = "Obscured Transaction Trail"
    SUSPICIOUS = "Suspicious Movement Detected"


class RiskRating(Enum):
    STABLE = "Stable"
    WATCHLIST = "Watchlist"
    IMMEDIATE = "Immediate Risk Alert"


@dataclass
class RiskParams:
    hop_thresh_obscured: int = 3
    hop_thresh_suspicious: int = 5
    proxy_count_suspicious: int = 2
    density_watchlist: int = 150
    density_critical: int = 300
    token_age_limit: int = 5       # days
    alert_threshold: int = 2


def dark_track(tx_path: List[str], cfg: RiskParams = RiskParams()) -> FlowStatus:
    """
    Classify a transaction hop path by length and proxy placeholders.
    """
    proxies = tx_path.count("unknown_wallet")

    if len(tx_path) > cfg.hop_thresh_suspicious and proxies >= cfg.proxy_count_suspicious:
        return FlowStatus.SUSPICIOUS
    if len(tx_path) > cfg.hop_thresh_obscured:
        return FlowStatus.OBSCURED
    return FlowStatus.NORMAL


def risk_alert(
    tx_density: float,
    token_age_days: int,
    recent_alerts: int,
    cfg: RiskParams = RiskParams(),
) -> RiskRating:
    """
    Evaluate overall risk using density, token age, and prior alert count.
    """
    if (
        tx_density > cfg.density_critical
        and token_age_days < cfg.token_age_limit
        and recent_alerts >= cfg.alert_threshold
    ):
        return RiskRating.IMMEDIATE
    if tx_density > cfg.density_watchlist:
        return RiskRating.WATCHLIST
    return RiskRating.STABLE


def log_trace(event: str, meta: str) -> None:
    print(f"[TRACE] {event} — {meta} @ {int(time())}")
