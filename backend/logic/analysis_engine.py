
class AnomalyScanner:
    def __init__(self, window_size=20):
        self.window_size = window_size
        self.values = []

    def add_value(self, val):
        self.values.append(val)
        if len(self.values) > self.window_size:
            self.values.pop(0)

    def detect_anomaly(self):
        if len(self.values) < self.window_size:
            return "Insufficient Data"
        avg = sum(self.values) / len(self.values)
        deviations = [abs(v - avg) for v in self.values]
        deviation_avg = sum(deviations) / len(deviations)
        if deviation_avg > avg * 0.2:
            return "🚨 Market Instability Detected"
        return "✅ Normal Market Behavior"
