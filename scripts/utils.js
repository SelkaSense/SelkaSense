
export function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

export function isValidAddress(addr) {
  return typeof addr === "string" && addr.length === 44;
}
