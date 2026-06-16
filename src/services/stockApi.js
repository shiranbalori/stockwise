import { getMockStock, getAvailableTickers } from '../data/mockStocks'
import { fetchFinnhubStock, isStockApiConfigured, buildChartFromPrice } from './marketDataProvider'
import { MESSAGES, logError } from '../constants/messages'

export { getAvailableTickers, isStockApiConfigured }

const DEFAULT_NEWS = [
  'אין חדשות זמינות כרגע עבור מניה זו.',
  'ניתן לחפש מקורות מידע נוספים לצורך למידה.',
]

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

function enrichLiveStock(live, mock) {
  const chartPoints = live.chartPoints?.length
    ? live.chartPoints
    : buildChartFromPrice(live.price)

  const news = live.news?.length
    ? live.news
    : mock?.news ?? DEFAULT_NEWS

  const aiAnalysis = mock?.aiAnalysis ?? DEFAULT_AI_ANALYSIS
  const riskLevel = mock?.riskLevel ?? deriveRiskLevel(live.changePercent)
  const rating = mock?.rating ?? deriveRating(live.changePercent)

  return {
    ...live,
    news,
    aiAnalysis,
    riskLevel,
    rating,
    chartPoints,
    isLive: true,
    usedFallback: false,
  }
}

function enrichMockStock(mock) {
  return {
    ...mock,
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

  if (isStockApiConfigured()) {
    try {
      const live = await fetchFinnhubStock(symbol)

      if (!live) {
        return { stock: null, notFound: true, error: null }
      }

      return {
        stock: enrichLiveStock(live, mock),
        notFound: false,
        error: null,
      }
    } catch (error) {
      logError('stockApi', error)

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
