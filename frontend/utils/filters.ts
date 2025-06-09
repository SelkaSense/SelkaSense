
export function smooth(data: number[]): number[] {
  const smoothed = [];
  for (let i = 1; i < data.length - 1; i++) {
    const avg = (data[i - 1] + data[i] + data[i + 1]) / 3;
    smoothed.push(avg);
  }
  return smoothed;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
