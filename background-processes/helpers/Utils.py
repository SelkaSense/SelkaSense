import numpy as np


def calculate_z_score(value: float, mean: float, std_dev: float) -> float:
    if std_dev == 0:
        return 0.0
    return round((value - mean) / std_dev, 4)


def exponential_moving_average(data: list[float], alpha: float = 0.3) -> list[float]:
    if not data:
        return []
    ema = [data[0]]
    for val in data[1:]:
        ema.append(alpha * val + (1 - alpha) * ema[-1])
    return ema


def normalize_series(series: list[float]) -> list[float]:
    if not series:
        return []
    min_val, max_val = min(series), max(series)
    if min_val == max_val:
        return [0.0 for _ in series]
    return [round((x - min_val) / (max_val - min_val), 4) for x in series]


def rolling_average(data: list[float], window: int = 3) -> list[float]:
    if window <= 0 or window > len(data):
        return []
    return [
        round(sum(data[i:i + window]) / window, 4)
        for i in range(len(data) - window + 1)
    ]


def detect_outliers_z(data: list[float], threshold: float = 2.5) -> list[float]:
    if not data:
        return []
    mean, std_dev = np.mean(data), np.std(data)
    if std_dev == 0:
        return []
    return [x for x in data if abs((x - mean) / std_dev) > threshold]


def weighted_average(values: list[float], weights: list[float]) -> float:
    if not values or not weights or len(values) != len(weights):
        return 0.0
    total_weight = sum(weights)
    if total_weight == 0:
        return 0.0
    return round(sum(v * w for v, w in zip(values, weights)) / total_weight, 4)


def spike_score(current: float, baseline: float) -> float:
    if baseline == 0:
        return 0.0
    return round((current - baseline) / baseline * 100, 2)


def vector_magnitude(vector: list[float]) -> float:
    return round(np.linalg.norm(vector), 4)
