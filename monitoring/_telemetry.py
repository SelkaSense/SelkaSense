import logging
import statistics
import time
from collections import deque
from datetime import datetime
from typing import Deque, List, Optional

###############################################################################
# Logging setup
###############################################################################

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-m-dT%H:%M:%SZ",
)

def log_event(event_type: str, payload: str) -> None:
    """Emit a single structured log line."""
    logging.info("[%s] %s", event_type.upper(), payload)


###############################################################################
# Anomaly-detection helpers
###############################################################################

def z_score(series: List[float], value: float) -> float:
    """Return the z-score of *value* relative to *series*."""
    if len(series) < 2:
        return 0.0
    mean = statistics.mean(series)
    stdev = statistics.stdev(series)
    return (value - mean) / stdev if stdev else 0.0


def detect_outliers(
    series: List[float],
    std_threshold: float = 3.0,
    pct_threshold: float = 1.5,
) -> List[float]:
    """
    Identify values that exceed either:
      • a multiple of standard deviation (z-score)
      • a multiple of the series mean (percent threshold)
    """
    if not series:
        return []

    mean = statistics.mean(series)
    outliers: List[float] = []

    for val in series:
        if z_score(series, val) > std_threshold or val > mean * pct_threshold:
            outliers.append(val)

    return outliers


###############################################################################
# Streaming anomaly monitor
###############################################################################

class StreamWatch:
    """
    Rolling window monitor that tracks the most recent *window_size* values
    and detects anomalies on demand.
    """

    def __init__(self, window_size: int = 300) -> None:
        self.window: Deque[float] = deque(maxlen=window_size)

    def add_event(self, value: float) -> None:
        """Append a new datapoint and emit a log entry."""
        self.window.append(value)
        log_event("event", f"latest_value={value}")

    def check_for_anomalies(self) -> Optional[List[float]]:
        """Return a list of anomalous values, if any."""
        if not self.window:
            log_event("status", "no_data")
            return None

        outliers = detect_outliers(list(self.window))
        if outliers:
            log_event("anomaly", f"count={len(outliers)} max={max(outliers)}")
            return outliers

        log_event("status", "stable")
        return None


###############################################################################
# Example usage
###############################################################################

if __name__ == "__main__":
    monitor = StreamWatch(window_size=120)

    # Simulate streaming data
    for i in range(1, 601):
        monitor.add_event(i * 0.5)          # nominal growth
        if i % 150 == 0:                    # inject a spike every 150 ticks
            monitor.add_event(i * 10)

        if i % 50 == 0:
            monitor.check_for_anomalies()

        time.sleep(0.01)  # small delay to mimic real-time feed
