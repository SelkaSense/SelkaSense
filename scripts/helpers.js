export function timeAgo(timestamp: number): string {
  if (!timestamp || typeof timestamp !== "number" || isNaN(timestamp)) return "Unknown time"

  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (seconds < 45) return "Just now"
  if (seconds < 90) return "1 minute ago"
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`

  const date = new Date(timestamp)
  return `on ${date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`
}
