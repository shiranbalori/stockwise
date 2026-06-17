import { fetchWeeklyPriceChange, isTwelveDataConfigured } from './twelveDataProvider'
import { fetchQuoteSummary } from './marketDataProvider'
import { logError } from '../constants/messages'

const TOP_COUNT = 5
const TICKER_GAP_MS = 250

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchTickerWeeklyGainer(symbol) {
  const weeklyData = await fetchWeeklyPriceChange(symbol)
  if (!weeklyData) return null

  let quote = null
  try {
    quote = await fetchQuoteSummary(symbol, { priority: 'normal' })
  } catch (error) {
    logError('weeklyGainersService', error)
  }

  const price = quote?.price ?? weeklyData.latestClose
  if (price == null || price <= 0) return null

  return {
    symbol,
    name: quote?.name ?? symbol,
    price,
    weeklyGainPercent: weeklyData.weeklyGainPercent,
  }
}

/**
 * Returns top weekly gainers in a category using real Twelve Data history + live quote.
 */
export async function getCategoryWeeklyLeaders(tickers, limit = TOP_COUNT) {
  if (!isTwelveDataConfigured()) {
    return { stocks: [], hasInsufficientData: true }
  }

  const results = []

  for (const symbol of tickers) {
    try {
      const stock = await fetchTickerWeeklyGainer(symbol)
      if (stock) {
        results.push(stock)
      }
    } catch (error) {
      logError('weeklyGainersService', error)
    }
    await sleep(TICKER_GAP_MS)
  }

  const sorted = [...results].sort((a, b) => b.weeklyGainPercent - a.weeklyGainPercent)
  const stocks = sorted.slice(0, limit)

  return {
    stocks,
    hasInsufficientData: stocks.length === 0,
  }
}
