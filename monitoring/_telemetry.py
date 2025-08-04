import logging
import statistics
import time
from collections import deque
from datetime import datetime
from typing import Deque, List, Optional, Callable

###############################################################################
# Logging setup
###############################################################################

logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s", "%Y-%m-%dT%H:%M:%SZ"))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

def log_event(event_type: str, payload: str) -> None:
    """Emit a single structured log line with event type and payload."""
    logger.info("[%s] %s", event_type.upper(), payload)


###############################################################################
# Anomaly-detection helpers
###############################################################################

def z_score(series: List[float], value: float) -> float:
    """Return the z-score of *value* relative to *series*."""
    n = len(series)
    if n < 2:
        return 0.0
    μ = statistics.mean(series)
    σ = statistics.stdev(series)
    return (value - μ) / σ if σ else 0.0


def detect_outliers(
    series: List[float],
    std_threshold: float = 3.0,
    pct_threshold: float = 1.5,
) -> List[float]:
    """
    Identify values that exceed either:
      • z-score > std_threshold
      • value > mean * pct_threshold
    """
    if not series:
        return []

    μ = statistics.mean(series)
    outliers: List[float] = []
    for val in series:
        if z_score(series, val) > std_threshold or val > μ * pct_threshold:
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

    def __init__(
        self,
        window_size: int = 300,
        anomaly_callback: Optional[Callable[[List[float]], None]] = None
    ) -> None:
        self.window: Deque[float] = deque(maxlen=window_size)
        self.anomaly_callback = anomaly_callback

    def add_event(self, value: float) -> None:
        """Append a new datapoint and emit a log entry."""
        timestamp = datetime.utcnow().isoformat()
        self.window.append(value)
        log_event("event", f"value={value:.2f} at {timestamp}")

    def check_for_anomalies(self) -> Optional[List[float]]:
        """Return list of anomalies, invoke callback if provided."""
        if not self.window:
            log_event("status", "no_data")
            return None

        data = list(self.window)
        outliers = detect_outliers(data)
        if outliers:
            count = len(outliers)
            max_outlier = max(outliers)
            log_event("anomaly", f"count={count} max={max_outlier:.2f}")
            if self.anomaly_callback:
                try:
                    self.anomaly_callback(outliers)
                except Exception as e:
                    logger.error("Anomaly callback error: %s", e)
            return outliers

        log_event("status", "stable")
        return None


###############################################################################
# Example usage
###############################################################################

if __name__ == "__main__":
    def on_anomaly(spikes: List[float]) -> None:
        print(">> ALERT! Detected spikes:", spikes)

    monitor = StreamWatch(window_size=120, anomaly_callback=on_anomaly)

    # Simulate streaming data
    for i in range(1, 601):
        monitor.add_event(i * 0.5)          # nominal growth
        if i % 150 == 0:                    # inject a spike every 150 ticks
            monitor.add_event(i * 10)

        if i % 50 == 0:
            monitor.check_for_anomalies()

        time.sleep(0.01)  # small delay to mimic real-time feed
