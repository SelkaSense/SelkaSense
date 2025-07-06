/**
 * Returns a human-readable relative time string for a given timestamp.
 * Uses Intl.RelativeTimeFormat if available, with fallbacks.
 *
 * @param timestamp — Date, number (ms since epoch), or ISO string
 * @param locale — BCP 47 locale string (default: 'en-US')
 */
export function timeAgo(
  timestamp: number | string | Date,
  locale: string = 'en-US'
): string {
  // Normalize to milliseconds since epoch
  const time = typeof timestamp === 'number'
    ? timestamp
    : new Date(timestamp).getTime()

  if (!Number.isFinite(time)) {
    return 'Unknown time'
  }

  const now = Date.now()
  const diffMs = time - now
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr  = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)
  const diffWk  = Math.round(diffDay / 7)
  const diffMo  = Math.round(diffDay / 30)
  const diffYr  = Math.round(diffDay / 365)

  // If Intl.RelativeTimeFormat is supported, use it
  if (typeof Intl !== 'undefined' && 'RelativeTimeFormat' in Intl) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    if (Math.abs(diffYr) >= 1)  return rtf.format(diffYr, 'year')
    if (Math.abs(diffMo) >= 1)  return rtf.format(diffMo, 'month')
    if (Math.abs(diffWk) >= 1)  return rtf.format(diffWk, 'week')
    if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day')
    if (Math.abs(diffHr) >= 1)  return rtf.format(diffHr, 'hour')
    if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute')
    return rtf.format(diffSec, 'second')
  }

  // Fallback formatting
  if (Math.abs(diffSec) < 45)        return 'Just now'
  if (Math.abs(diffSec) < 90)        return diffSec < 0 ? '1 minute ago' : 'in 1 minute'
  if (Math.abs(diffMin) < 60)        return `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? 's' : ''} ${diffMin < 0 ? 'ago' : 'from now'}`
  if (Math.abs(diffHr) < 24)         return `${Math.abs(diffHr)} hour${Math.abs(diffHr) !== 1 ? 's' : ''} ${diffHr < 0 ? 'ago' : 'from now'}`
  if (Math.abs(diffDay) < 7)         return `${Math.abs(diffDay)} day${Math.abs(diffDay) !== 1 ? 's' : ''} ${diffDay < 0 ? 'ago' : 'from now'}`
  if (Math.abs(diffWk) < 5)          return `${Math.abs(diffWk)} week${Math.abs(diffWk) !== 1 ? 's' : ''} ${diffWk < 0 ? 'ago' : 'from now'}`
  if (Math.abs(diffMo) < 12)         return `${Math.abs(diffMo)} month${Math.abs(diffMo) !== 1 ? 's' : ''} ${diffMo < 0 ? 'ago' : 'from now'}`
  // Fallback to full date for >1 year
  const date = new Date(time)
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}
