from collections import deque
from statistics import mean, stdev
from typing import Deque, List


def normalize_data(data: List[float]) -> List[float]:
    if not data:
        return []
    mn, mx = min(data), max(data)
    rng = mx - mn or 1e-9
    return [(x - mn) / rng for x in data]


def detect_signal_peaks(values: List[float], threshold: float = 0.85) -> List[int]:
    return [i for i, v in enumerate(values) if v > threshold]


class SignalProcessor:
    def __init__(self, window: int = 50, peak_threshold: float = 0.85) -> None:
        self.window: Deque[float] = deque(maxlen=window)
        self.peak_threshold = peak_threshold

    # --------------------------- Public API --------------------------- #

    def feed(self, val: float) -> None:
        self.window.append(val)

    def analyze(self) -> str:
        if len(self.window) < 10:
            return "Waiting for data…"

        norm = normalize_data(list(self.window))
        peaks = detect_signal_peaks(norm, self.peak_threshold)
        zscore = self._max_z_score()

        if peaks:
            return f"{len(peaks)} spike(s) detected | max z={zscore:.2f}"
        return f"No spikes | max z={zscore:.2f}"

    # ------------------------- Internal utils ------------------------ #

    def _max_z_score(self) -> float:
        vals = list(self.window)
        μ, σ = mean(vals), stdev(vals) or 1e-9
        return max(abs(x - μ) / σ for x in vals)
