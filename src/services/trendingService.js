import { isStockApiConfigured } from './marketDataProvider'
import {
  fetchQuoteSummary,
  fetchCompanyNewsRaw,
  fetchNewsSentiment,
} from './marketDataProvider'
import { logError } from '../constants/messages'
import { STOCK_CATEGORIES } from '../data/stockCategories'

const RECENT_DAYS = 7
const VERY_RECENT_DAYS = 3
const TOP_COUNT = 5

function countRecentNews(newsItems) {
  const nowSec = Date.now() / 1000
  const recentCutoff = nowSec - RECENT_DAYS * 86400
  const veryRecentCutoff = nowSec - VERY_RECENT_DAYS * 86400

  let recent = 0
  let veryRecent = 0

  for (const item of newsItems) {
    const ts = item?.datetime
    if (typeof ts !== 'number') continue
    if (ts >= recentCutoff) recent++
    if (ts >= veryRecentCutoff) veryRecent++
  }

  return { recent, veryRecent }
}

function buildSentimentLabel(sentiment) {
  if (!sentiment?.sentiment) {
    return { label: 'לא זמין', detail: null, hasSentiment: false }
  }

  const bullish = sentiment.sentiment.bullishPercent ?? 0
  const bearish = sentiment.sentiment.bearishPercent ?? 0
  const bullishPct = Math.round(bullish * 100)
  const bearishPct = Math.round(bearish * 100)

  if (bullishPct === 0 && bearishPct === 0) {
    return { label: 'לא זמין', detail: null, hasSentiment: false }
  }

  if (bullish > bearish + 0.1) {
    return { label: 'חיובי', detail: `${bullishPct}% חיובי`, hasSentiment: true }
  }
  if (bearish > bullish + 0.1) {
    return { label: 'שלילי', detail: `${bearishPct}% שלילי`, hasSentiment: true }
  }
  return { label: 'מעורב', detail: `${bullishPct}% חיובי / ${bearishPct}% שלילי`, hasSentiment: true }
}

function computeRawScore({ newsCount, veryRecentCount, sentiment }) {
  let score = newsCount * 10 + veryRecentCount * 15

  if (sentiment?.buzz?.articlesInLastWeek) {
    score += sentiment.buzz.articlesInLastWeek * 2
  }
  if (sentiment?.buzz?.buzz) {
    score += sentiment.buzz.buzz * 20
  }
  if (typeof sentiment?.companyNewsScore === 'number') {
    score += sentiment.companyNewsScore * 25
  }

  return score
}

function normalizeInterestScores(stocks) {
  const withData = stocks.filter((s) => !s.hasInsufficientData)
  if (withData.length === 0) {
    return stocks.map((s) => ({ ...s, interestScore: 0 }))
  }

  const rawScores = withData.map((s) => s.rawScore)
  const max = Math.max(...rawScores)
  const min = Math.min(...rawScores)

  return stocks.map((stock) => {
    if (stock.hasInsufficientData) {
      return { ...stock, interestScore: 0 }
    }
    if (max === min) {
      return { ...stock, interestScore: stock.rawScore > 0 ? 70 : 0 }
    }
    const normalized = Math.round(((stock.rawScore - min) / (max - min)) * 100)
    return { ...stock, interestScore: normalized }
  })
}

async function fetchTickerTrending(symbol) {
  const [quoteData, newsItems, sentiment] = await Promise.all([
    fetchQuoteSummary(symbol).catch(() => null),
    fetchCompanyNewsRaw(symbol, RECENT_DAYS).catch(() => []),
    fetchNewsSentiment(symbol).catch(() => null),
  ])

  const news = Array.isArray(newsItems) ? newsItems : []
  const { recent, veryRecent } = countRecentNews(news)
  const { label, detail, hasSentiment } = buildSentimentLabel(sentiment)

  const buzzArticles = sentiment?.buzz?.articlesInLastWeek ?? 0
  const hasInsufficientData = recent === 0 && buzzArticles === 0 && !hasSentiment

  const rawScore = computeRawScore({
    newsCount: recent,
    veryRecentCount: veryRecent,
    sentiment,
  })

  return {
    symbol,
    name: quoteData?.name ?? symbol,
    price: quoteData?.price ?? null,
    changePercent: quoteData?.changePercent ?? null,
    newsCount: recent,
    sentimentLabel: label,
    sentimentDetail: detail,
    hasSentiment,
    hasInsufficientData,
    rawScore,
    interestScore: 0,
  }
}

/**
 * Fetches real trending data for all tickers in a category, sorted by interest score.
 */
export async function getCategoryTrending(tickers) {
  if (!isStockApiConfigured()) {
    return {
      stocks: [],
      sortedTickers: tickers,
      hasInsufficientData: true,
      apiFailed: true,
    }
  }

  try {
    const results = await Promise.all(
      tickers.map((symbol) =>
        fetchTickerTrending(symbol).catch((error) => {
          logError('trendingService', error)
          return {
            symbol,
            name: symbol,
            price: null,
            changePercent: null,
            newsCount: 0,
            sentimentLabel: 'לא זמין',
            sentimentDetail: null,
            hasSentiment: false,
            hasInsufficientData: true,
            rawScore: 0,
            interestScore: 0,
          }
        }),
      ),
    )

    const scored = normalizeInterestScores(results)
    const sorted = [...scored].sort((a, b) => {
      if (a.hasInsufficientData !== b.hasInsufficientData) {
        return a.hasInsufficientData ? 1 : -1
      }
      return b.interestScore - a.interestScore
    })

    const topStocks = sorted.filter((s) => !s.hasInsufficientData).slice(0, TOP_COUNT)
    const hasInsufficientData = topStocks.length === 0
    const sortedTickers = sorted.map((s) => s.symbol)

    return {
      stocks: topStocks,
      sortedTickers,
      hasInsufficientData,
      apiFailed: false,
    }
  } catch (error) {
    logError('trendingService', error)
    return {
      stocks: [],
      sortedTickers: tickers,
      hasInsufficientData: true,
      apiFailed: true,
    }
  }
}

/**
 * Aggregates top trending stocks across all categories for the weekly view.
 */
export async function getWeeklyTrendingStocks(limit = 10) {
  if (!isStockApiConfigured()) {
    return { stocks: [], hasInsufficientData: true }
  }

  try {
    const categoryResults = await Promise.all(
      STOCK_CATEGORIES.map((cat) => getCategoryTrending(cat.tickers)),
    )

    const bySymbol = new Map()
    for (const result of categoryResults) {
      for (const stock of result.stocks) {
        if (stock.hasInsufficientData) continue
        const existing = bySymbol.get(stock.symbol)
        if (!existing || stock.interestScore > existing.interestScore) {
          bySymbol.set(stock.symbol, stock)
        }
      }
    }

    const stocks = [...bySymbol.values()]
      .sort((a, b) => b.interestScore - a.interestScore)
      .slice(0, limit)

    return {
      stocks,
      hasInsufficientData: stocks.length === 0,
    }
  } catch (error) {
    logError('trendingService', error)
    return { stocks: [], hasInsufficientData: true }
  }
}
