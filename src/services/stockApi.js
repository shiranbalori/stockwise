import { getMockStock, getAvailableTickers } from '../data/mockStocks'
import { fetchFinnhubStock, isStockApiConfigured } from './marketDataProvider'
import { FinnhubRateLimitError } from './finnhubCache'
import { MESSAGES, logError } from '../constants/messages'

export { getAvailableTickers, isStockApiConfigured }

function devLogSearch(label, payload) {
  if (import.meta.env.DEV) {
    console.debug(`[Stock Search] ${label}`, payload)
  }
}

const DEFAULT_AI_ANALYSIS =
  'ניתוח לימודי כללי: מומלץ לבחון את יסודות החברה, סביבת השוק והסיכונים לפני קבלת החלטות. מידע זה אינו מהווה ייעוץ השקעות.'

function deriveRiskLevel(changePercent) {
  const absChange = Math.abs(changePercent)
  if (absChange >= 5) return 'High'
  if (absChange >= 2) return 'Medium'
  return 'Low'
}

function deriveRating(changePercent) {
  const absChange = Math.abs(changePercent)
  if (absChange >= 5) return 'Risky'
  if (absChange >= 2) return 'Neutral'
  return 'Interesting'
}

function mockNewsToArticles(mock) {
  if (!mock?.news?.length) return []
  return mock.news.map((headline, i) => ({
    id: `mock-${mock.symbol}-${i}`,
    headline,
    source: 'נתוני גיבוי',
    summary: headline,
    url: null,
    datetime: null,
    related: mock.symbol,
  }))
}

function enrichLiveStock(live, mock) {
  const newsArticles = live.newsArticles?.length ? live.newsArticles : []

  const aiAnalysis = mock?.aiAnalysis ?? DEFAULT_AI_ANALYSIS
  const riskLevel = mock?.riskLevel ?? deriveRiskLevel(live.changePercent)
  const rating = mock?.rating ?? deriveRating(live.changePercent)

  return {
    ...live,
    newsArticles,
    aiAnalysis,
    riskLevel,
    rating,
    isLive: true,
    usedFallback: false,
  }
}

function enrichMockStock(mock) {
  return {
    ...mock,
    newsArticles: mockNewsToArticles(mock),
    isLive: false,
    usedFallback: true,
  }
}

/**
 * Single entry point for all stock data in the app.
 * @returns {{ stock: object|null, notFound: boolean, error: string|null }}
 */
export async function getStockData(ticker) {
  const symbol = ticker?.trim().toUpperCase()
  if (!symbol) {
    return { stock: null, notFound: false, error: MESSAGES.emptyTicker }
  }

  const mock = getMockStock(symbol)
  devLogSearch('searched ticker', symbol)

  if (isStockApiConfigured()) {
    try {
      const live = await fetchFinnhubStock(symbol)

      if (!live) {
        devLogSearch('final stock object', null)
        return { stock: null, notFound: true, error: null }
      }

      const stock = enrichLiveStock(live, mock)
      devLogSearch('final stock object', stock)

      return {
        stock,
        notFound: false,
        error: null,
      }
    } catch (error) {
      logError('stockApi', error)

      if (error instanceof FinnhubRateLimitError) {
        return { stock: null, notFound: false, error: MESSAGES.rateLimit }
      }

      if (mock) {
        return { stock: enrichMockStock(mock), notFound: false, error: null }
      }

      return {
        stock: null,
        notFound: false,
        error: error?.message || MESSAGES.stockLoadFailed,
      }
    }
  }

  if (mock) {
    return { stock: enrichMockStock(mock), notFound: false, error: null }
  }

  return { stock: null, notFound: true, error: null }
}
