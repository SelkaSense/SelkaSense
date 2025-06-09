
def normalize_data(data):
    min_val = min(data)
    max_val = max(data)
    return [(x - min_val) / (max_val - min_val) for x in data]

def detect_signal_peaks(normalized):
    threshold = 0.85
    peaks = [i for i, v in enumerate(normalized) if v > threshold]
    return peaks

class SignalProcessor:
    def __init__(self):
        self.history = []

    def feed(self, val):
        self.history.append(val)
        if len(self.history) > 50:
            self.history.pop(0)

    def analyze(self):
        if len(self.history) < 10:
            return "🔄 Waiting for Data"
        normalized = normalize_data(self.history)
        peaks = detect_signal_peaks(normalized)
        return f"🔔 {len(peaks)} spike(s) detected" if peaks else "✅ No spikes"
