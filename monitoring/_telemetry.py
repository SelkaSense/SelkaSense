
def advanced_log_event(event_type, data):
    import datetime
    timestamp = datetime.datetime.utcnow().isoformat()
    print(f"[{timestamp}] - [{event_type}] - {data}")

def detect_anomalous_patterns(data_series):
    mean = sum(data_series) / len(data_series)
    threshold = mean * 1.5
    outliers = [val for val in data_series if val > threshold]
    return outliers if outliers else None

class StreamWatch:
    def __init__(self):
        self.events = []

    def add_event(self, value):
        self.events.append(value)
        if len(self.events) > 100:
            self.events.pop(0)

    def check_for_anomalies(self):
        if not self.events:
            return "No Data"
        anomalies = detect_anomalous_patterns(self.events)
        return "⚠️ Anomaly Detected" if anomalies else "✅ Stable"
