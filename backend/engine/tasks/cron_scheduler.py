# risk_monitor.py
from dataclasses import dataclass
from enum import Enum, auto
from time import time
from typing import List


class TraceStatus(Enum):
    NORMAL = "normal"
    OBSCURED = "obscured"
    SUSPICIOUS = "suspicious"


class RiskLevel(Enum):
    STABLE = "stable"
    WATCHLIST = "watchlist"
    IMMEDIATE = "immediate"


@dataclass
class RiskConfig:
    max_hops_normal: int = 3
    proxy_threshold: int = 2
    density_watch: int = 150
    density_critical: int = 300
    token_age_limit: int = 5         # days
    recent_alert_limit: int = 2


def dark_track(tx_path: List[str], cfg: RiskConfig = RiskConfig()) -> TraceStatus:
    """
    Determine how opaque a transaction path is based on hop count
    and the presence of 'unknown_wallet' placeholders.
    """
    proxies = tx_path.count("unknown_wallet")

    if len(tx_path) > cfg.max_hops_normal and proxies >= cfg.proxy_threshold:
        return TraceStatus.SUSPICIOUS
    if len(tx_path) > cfg.max_hops_normal:
        return TraceStatus.OBSCURED
    return TraceStatus.NORMAL


def risk_alert(
    tx_density: float,
    token_age_days: int,
    recent_alerts: int,
    cfg: RiskConfig = RiskConfig(),
) -> RiskLevel:
    """
    Evaluate overall risk considering traffic density, token age, and past alerts.
    """
    if (
        tx_density > cfg.density_critical
        and token_age_days < cfg.token_age_limit
        and recent_alerts >= cfg.recent_alert_limit
    ):
        return RiskLevel.IMMEDIATE
    if tx_density > cfg.density_watch:
        return RiskLevel.WATCHLIST
    return RiskLevel.STABLE


def log_trace(event: str, meta: str) -> None:
    ts = time()
    print(f"[TRACE] {event} — {meta} @ {ts:.0f}")
