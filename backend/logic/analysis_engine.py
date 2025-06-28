
from collections import deque
from statistics import mean, stdev
from typing import Deque, List, Union, Tuple


class TrendState:
    STABLE = "stable"
    VOLATILE = "volatile"
    UNDEFINED = "undefined"


class AnomalyScanner:
    """
    Rolling‐window anomaly detector.

    • Keeps a fixed-length buffer of the most recent values
    • Computes z-score and mean-absolute deviation (MAD)
    • Emits `volatile` if deviation exceeds configurable threshold
    """

    def __init__(
        self,
        window_size: int = 50,
        z_threshold: float = 3.0,
        mad_threshold: float = 0.25,
    ) -> None:
        self.window_size = window_size
        self.z_threshold = z_threshold
        self.mad_threshold = mad_threshold
        self.buffer: Deque[float] = deque(maxlen=window_size)

    # ------------------------------------------------------------------ #
    #  Public interface                                                  #
    # ------------------------------------------------------------------ #

    def add_value(self, value: float) -> None:
        """Append a new observation."""
        self.buffer.append(value)

    def state(self) -> str:
        """Return current market state."""
        if len(self.buffer) < self.window_size:
            return TrendState.UNDEFINED
        return TrendState.VOLATILE if self._is_anomalous() else TrendState.STABLE

    def summary(self) -> Tuple[str, float]:
        """
        Return (state, deviation_score) where deviation_score =
        max z-score of the buffer or MAD ratio, whichever is higher.
        """
        if len(self.buffer) < self.window_size:
            return TrendState.UNDEFINED, 0.0

        z_max = self._max_z_score()
        mad_ratio = self._mad_ratio()
        deviation_score = max(z_max / self.z_threshold, mad_ratio / self.mad_threshold)
        return self.state(), deviation_score

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                  #
    # ------------------------------------------------------------------ #

    def _max_z_score(self) -> float:
        """Highest absolute z-score within the buffer."""
        buf: List[float] = list(self.buffer)
        mu = mean(buf)
        sigma = stdev(buf) or 1e-9
        return max(abs(x - mu) / sigma for x in buf)

    def _mad_ratio(self) -> float:
        """Mean absolute deviation ratio to mean."""
        buf = list(self.buffer)
        mu = mean(buf)
        mad = mean(abs(x - mu) for x in buf)
        return mad / mu if mu else 0.0

    def _is_anomalous(self) -> bool:
        """Check if current buffer signals instability."""
        return self._max_z_score() > self.z_threshold or self._mad_ratio() > self.mad_threshold


# ----------------------------- Quick demo ----------------------------- #
if __name__ == "__main__":
    import random
    scanner = AnomalyScanner(window_size=30)

    # Warm-up with stable data
    for _ in range(30):
        scanner.add_value(random.uniform(95, 105))
    print("Initial state:", scanner.summary())

    # Inject anomaly
    for _ in range(10):
        scanner.add_value(random.uniform(200, 250))
    print("After spike:", scanner.summary())
