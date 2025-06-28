import fetch from "node-fetch"

/* ---------- Types ---------- */

interface Order {
  price: number
  size: number
}

interface OrderBook {
  bids: Order[]
  asks: Order[]
  timestamp: number
}

interface BookSummary {
  midPrice: number
  spreadPercent: number
  imbalance: number
  totalDepthUSD: number
  timestamp: number
}

/* ---------- Analyzer ---------- */

export class OrderBookAnalyzer {
  constructor(private readonly apiUrl: string) {}

  /* Fetch level-2 book */
  async fetchOrderBook(symbol: string, depth = 50): Promise<OrderBook> {
    const res = await fetch(`${this.apiUrl}/markets/${symbol}/orderbook?depth=${depth}`, {
      timeout: 10_000,
    })
    if (!res.ok) throw new Error(`Order-book fetch error ${res.status}: ${res.statusText}`)
    return (await res.json()) as OrderBook
  }

  /* Mid-price from top level */
  midPrice(book: OrderBook): number {
    const bid = book.bids[0]?.price ?? 0
    const ask = book.asks[0]?.price ?? 0
    return (bid + ask) / 2
  }

  /* Percentage spread */
  spreadPct(book: OrderBook): number {
    const bid = book.bids[0]?.price ?? 0
    const ask = book.asks[0]?.price ?? 0
    return bid && ask ? ((ask - bid) / ((ask + bid) / 2)) * 100 : 0
  }

  /* Liquidity imbalance (−1 … +1) */
  imbalance(book: OrderBook): number {
    const bidVol = book.bids.reduce((s, o) => s + o.size, 0)
    const askVol = book.asks.reduce((s, o) => s + o.size, 0)
    const total = bidVol + askVol
    return total ? (bidVol - askVol) / total : 0
  }

  /* Depth value in USD up to N levels */
  depthUSD(book: OrderBook, levels = 10): number {
    const sliceBid = book.bids.slice(0, levels)
    const sliceAsk = book.asks.slice(0, levels)
    const bidVal = sliceBid.reduce((s, o) => s + o.price * o.size, 0)
    const askVal = sliceAsk.reduce((s, o) => s + o.price * o.size, 0)
    return bidVal + askVal
  }

  /* Summarize metrics */
  summarize(book: OrderBook, depthUsdLevels = 10): BookSummary {
    return {
      midPrice: this.midPrice(book),
      spreadPercent: this.spreadPct(book),
      imbalance: this.imbalance(book),
      totalDepthUSD: this.depthUSD(book, depthUsdLevels),
      timestamp: book.timestamp,
    }
  }
}
