// logger.ts

type Category = "info" | "warn" | "error" | "debug" | string

interface LogEvent<T = unknown> {
  type: Category
  payload: T
  timestamp?: string
}

function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString()
}

export function logEvent<T = unknown>(type: Category, payload: T): LogEvent<T> {
  const entry: LogEvent<T> = { type, payload, timestamp: formatTimestamp() }
  // eslint-disable-next-line no-console
  console.log(`[${entry.type}] ${entry.timestamp}:`, entry.payload)
  return entry
}

export function batchLog<T = unknown>(events: LogEvent<T>[]): void {
  events.forEach(e => logEvent(e.type, e.payload))
}

/* ------------------------------------------------------------------ *
 * Optional: buffered logger that flushes in one call                  *
 * ------------------------------------------------------------------ */

export class BufferedLogger {
  private buffer: LogEvent[] = []

  push<T = unknown>(type: Category, payload: T): void {
    this.buffer.push({ type, payload })
  }

  flush(): void {
    batchLog(this.buffer)
    this.buffer = []
  }

  size(): number {
    return this.buffer.length
  }
}
