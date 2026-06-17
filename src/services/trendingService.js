import { isStockApiConfigured, isFinnhubRateLimited } from './marketDataProvider'
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
const WEEKLY_MIN_DISPLAY = 5
const INITIAL_TRENDING_COUNT = 5
const WEEKLY_CACHE_KEY = 'stockwise_weekly_trending_v2'
const CACHE_TTL_MS = 30 * 60 * 1000
const INITIAL_LOAD_DELAY_MS = 3000
const EXPANDED_LOAD_DELAY_MS = 12000
const LITE_TICKER_GAP_MS = 200

function devLogWeekly(label, payload) {
  if (import.meta.env.DEV) {
    console.debug(`[Weekly Trending] ${label}`, payload)
  }
}

function countRecentNews(newsItems) {
  const nowSec = Date.now() / 1000
  const recentCutoff = nowSec - RECENT_DAYS * 86400
  const veryRecentCutoff = nowSec - VERY_RECENT_DAYS * 86400

  let recent = 0
  let veryRecent = 0

  for (const item of newsItems) {
    const ts = toUnixSeconds(item?.datetime)
    if (ts == null) continue
    if (ts >= recentCutoff) recent++
    if (ts >= veryRecentCutoff) veryRecent++
  }

  return { recent, veryRecent }
}

function toUnixSeconds(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value)
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000)
    }
  }
  return null
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

function computeMentionScore({ newsCount, veryRecentCount }) {
  return newsCount * 10 + veryRecentCount * 15
}

function sortByMentions(a, b) {
  if (a.hasInsufficientData !== b.hasInsufficientData) {
    return a.hasInsufficientData ? 1 : -1
  }
  if (b.newsCount !== a.newsCount) {
    return b.newsCount - a.newsCount
  }
  if (b.interestScore !== a.interestScore) {
    return b.interestScore - a.interestScore
  }
  return b.rawScore - a.rawScore
}

function hasRealNewsMentions(stock) {
  return !stock.hasInsufficientData && stock.newsCount >= 1
}

function filterMentionRankedStocks(stocks) {
  return stocks.filter(hasRealNewsMentions)
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

function failedTickerResult(symbol) {
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
}

function hasSentimentData(sentiment) {
  if (!sentiment) return false
  if (sentiment.buzz?.articlesInLastWeek > 0) return true
  if (sentiment.buzz?.buzz > 0) return true
  if (typeof sentiment.companyNewsScore === 'number') return true
  return buildSentimentLabel(sentiment).hasSentiment
}

function getInitialWeeklyTickers(count = INITIAL_TRENDING_COUNT) {
  const tickers = []
  for (const category of STOCK_CATEGORIES) {
    if (category.tickers[0]) {
      tickers.push(category.tickers[0])
    }
    if (tickers.length >= count) break
  }
  return tickers.slice(0, count)
}

function getExpandedWeeklyTickers(excludeSymbols = []) {
  const exclude = new Set(excludeSymbols.map((symbol) => symbol.toUpperCase()))
  return [...new Set(STOCK_CATEGORIES.flatMap((cat) => cat.tickers))].filter(
    (symbol) => !exclude.has(symbol.toUpperCase()),
  )
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchTickerMentionTrending(symbol, { priority = 'low' } = {}) {
  try {
    const [quoteData, newsItems] = await Promise.allSettled([
      fetchQuoteSummary(symbol, { priority }),
      fetchCompanyNewsRaw(symbol, RECENT_DAYS, { priority }),
    ])

    const quote = quoteData.status === 'fulfilled' ? quoteData.value : null
    const news = newsItems.status === 'fulfilled' && Array.isArray(newsItems.value)
      ? newsItems.value
      : []
    const { recent, veryRecent } = countRecentNews(news)
    const hasInsufficientData = recent === 0
    const rawScore = hasInsufficientData
      ? 0
      : computeMentionScore({ newsCount: recent, veryRecentCount: veryRecent })

    return {
      symbol,
      name: quote?.name ?? symbol,
      price: quote?.price ?? null,
      changePercent: quote?.changePercent ?? null,
      newsCount: recent,
      sentimentLabel: 'לא זמין',
      sentimentDetail: null,
      hasSentiment: false,
      hasInsufficientData,
      rawScore,
      interestScore: 0,
    }
  } catch (error) {
    logError('trendingService', error)
    return failedTickerResult(symbol)
  }
}

async function fetchMentionTickersSequential(tickers, { priority = 'low' } = {}) {
  const results = []

  devLogWeekly('mention tickers', tickers)

  for (const symbol of tickers) {
    const outcome = await Promise.allSettled([fetchTickerMentionTrending(symbol, { priority })])
    const result = outcome[0]
    if (result.status === 'fulfilled') {
      results.push(result.value)
    } else {
      logError('trendingService', result.reason)
      results.push(failedTickerResult(symbol))
    }
    await sleep(LITE_TICKER_GAP_MS)
  }

  devLogWeekly('mention responses', {
    requested: tickers.length,
    withMentions: results.filter((item) => item.newsCount >= 1).length,
  })

  return results
}

function isNewsDataUnavailable(results) {
  if (!isFinnhubRateLimited()) return false
  return !results.some((item) => item.newsCount >= 1)
}

async function fetchTickerTrending(symbol) {
  const [quoteData, newsItems, sentiment] = await Promise.allSettled([
    fetchQuoteSummary(symbol, { priority: 'normal' }),
    fetchCompanyNewsRaw(symbol, RECENT_DAYS, { priority: 'normal' }),
    fetchNewsSentiment(symbol, { priority: 'normal' }),
  ])

  const quote = quoteData.status === 'fulfilled' ? quoteData.value : null
  const news = newsItems.status === 'fulfilled' && Array.isArray(newsItems.value)
    ? newsItems.value
    : []
  const sentimentValue = sentiment.status === 'fulfilled' ? sentiment.value : null

  const { recent, veryRecent } = countRecentNews(news)
  const { label, detail, hasSentiment } = buildSentimentLabel(sentimentValue)

  const hasSentimentSignal = hasSentiment || hasSentimentData(sentimentValue)
  const hasInsufficientData = recent === 0

  const rawScore = hasInsufficientData
    ? 0
    : computeMentionScore({ newsCount: recent, veryRecentCount: veryRecent })

  return {
    symbol,
    name: quote?.name ?? symbol,
    price: quote?.price ?? null,
    changePercent: quote?.changePercent ?? null,
    newsCount: recent,
    sentimentLabel: label,
    sentimentDetail: detail,
    hasSentiment: hasSentimentSignal,
    hasInsufficientData,
    rawScore,
    interestScore: 0,
  }
}

function rankWeeklyStocks(results, limit) {
  const scored = normalizeInterestScores(results)
  const usable = filterMentionRankedStocks(scored)
  const sorted = [...usable].sort(sortByMentions)
  const newsDataUnavailable = isNewsDataUnavailable(results)

  devLogWeekly('tickers with mentions', usable.length)
  devLogWeekly(
    'final ranked list',
    sorted.slice(0, limit).map((s) => ({
      symbol: s.symbol,
      interestScore: s.interestScore,
      rawScore: s.rawScore,
      newsCount: s.newsCount,
      price: s.price,
    })),
  )

  const targetCount =
    usable.length >= WEEKLY_MIN_DISPLAY
      ? Math.min(limit, usable.length)
      : usable.length

  return {
    stocks: sorted.slice(0, targetCount),
    hasInsufficientData: usable.length === 0 && !newsDataUnavailable,
    newsDataUnavailable,
  }
}

export function readWeeklyTrendingCache() {
  try {
    const parsed = readWeeklyTrendingCacheRaw()
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      return null
    }

    return normalizeWeeklyCacheEntry(parsed)
  } catch {
    return null
  }
}

function normalizeWeeklyCacheEntry(parsed) {
  const stocks = filterMentionRankedStocks(
    Array.isArray(parsed?.stocks) ? parsed.stocks : [],
  )
  return {
    stocks,
    hasInsufficientData: stocks.length === 0 && Boolean(parsed?.hasInsufficientData),
    newsDataUnavailable: Boolean(parsed?.newsDataUnavailable),
  }
}

function readWeeklyTrendingCacheRaw() {
  const raw = localStorage.getItem(WEEKLY_CACHE_KEY)
  if (!raw) return null
  return JSON.parse(raw)
}

function readWeeklyTrendingCacheStale() {
  try {
    const parsed = readWeeklyTrendingCacheRaw()
    if (!parsed) return null
    return normalizeWeeklyCacheEntry(parsed)
  } catch {
    return null
  }
}

export function getInitialWeeklyTrendingState() {
  const cached = readWeeklyTrendingCache() ?? readWeeklyTrendingCacheStale()
  if (cached?.newsDataUnavailable) {
    return {
      stocks: [],
      loading: true,
      fetchComplete: false,
      hasInsufficientData: false,
      newsDataUnavailable: false,
    }
  }
  if (cached?.stocks?.length > 0) {
    return {
      stocks: cached.stocks,
      loading: false,
      fetchComplete: false,
      hasInsufficientData: false,
      newsDataUnavailable: false,
    }
  }
  return {
    stocks: [],
    loading: true,
    fetchComplete: false,
    hasInsufficientData: false,
    newsDataUnavailable: false,
  }
}

export function resolveWeeklyTrendingUpdate(currentStocks, fresh, cached) {
  const previous = filterMentionRankedStocks(
    currentStocks.length > 0
      ? currentStocks
      : (cached?.stocks?.length > 0 ? cached.stocks : []),
  )

  if (fresh.newsDataUnavailable) {
    return {
      stocks: [],
      hasInsufficientData: false,
      newsDataUnavailable: true,
      shouldWriteCache: true,
    }
  }

  if (fresh.stocks.length >= WEEKLY_MIN_DISPLAY) {
    if (import.meta.env.DEV && previous.length > 0) {
      devLogWeekly('results overwritten with fresh data', {
        previousCount: previous.length,
        freshCount: fresh.stocks.length,
      })
    }
    return {
      stocks: fresh.stocks,
      hasInsufficientData: false,
      newsDataUnavailable: false,
      shouldWriteCache: true,
    }
  }

  if (fresh.stocks.length > 0) {
    return {
      stocks: fresh.stocks,
      hasInsufficientData: false,
      newsDataUnavailable: false,
      shouldWriteCache: true,
    }
  }

  if (previous.length > 0) {
    if (import.meta.env.DEV) {
      devLogWeekly('kept previous results — fresh fetch insufficient', {
        previousCount: previous.length,
        freshCount: fresh.stocks.length,
      })
    }
    return {
      stocks: previous,
      hasInsufficientData: false,
      newsDataUnavailable: false,
      shouldWriteCache: false,
    }
  }

  return {
    stocks: [],
    hasInsufficientData: fresh.hasInsufficientData,
    newsDataUnavailable: false,
    shouldWriteCache: false,
  }
}

function writeWeeklyTrendingCache(result) {
  if (result.stocks.length === 0 && !result.newsDataUnavailable) {
    devLogWeekly('cache write skipped — empty result', null)
    return
  }

  try {
    localStorage.setItem(
      WEEKLY_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        stocks: result.stocks,
        hasInsufficientData: result.hasInsufficientData,
        newsDataUnavailable: Boolean(result.newsDataUnavailable),
      }),
    )
  } catch {
    // ignore quota / private mode errors
  }
}

async function fetchWeeklyTrendingMentions(tickers, limit) {
  if (!isStockApiConfigured()) {
    return { stocks: [], hasInsufficientData: true, newsDataUnavailable: false }
  }

  const results = await fetchMentionTickersSequential(tickers, { priority: 'low' })
  return rankWeeklyStocks(results, limit)
}

function mergeTrendingResults(currentStocks, newResults, limit) {
  const bySymbol = new Map()

  for (const stock of [...currentStocks, ...newResults]) {
    const existing = bySymbol.get(stock.symbol)
    if (!existing || stock.rawScore > existing.rawScore) {
      bySymbol.set(stock.symbol, stock)
    }
  }

  return rankWeeklyStocks([...bySymbol.values()], limit)
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
      newsDataUnavailable: false,
      apiFailed: true,
    }
  }

  try {
    const settled = await Promise.allSettled(tickers.map((symbol) => fetchTickerTrending(symbol)))
    const results = settled.map((outcome, index) => {
      if (outcome.status === 'fulfilled') return outcome.value
      logError('trendingService', outcome.reason)
      return failedTickerResult(tickers[index])
    })

    const scored = normalizeInterestScores(results)
    const sorted = [...scored].sort(sortByMentions)

    const usable = filterMentionRankedStocks(sorted)
    const topStocks = usable.slice(0, TOP_COUNT)
    const newsDataUnavailable = isNewsDataUnavailable(results)
    const hasInsufficientData = usable.length === 0 && !newsDataUnavailable
    const sortedTickers = sorted.map((s) => s.symbol)

    return {
      stocks: topStocks,
      sortedTickers,
      hasInsufficientData,
      newsDataUnavailable,
      apiFailed: false,
    }
  } catch (error) {
    logError('trendingService', error)
    return {
      stocks: [],
      sortedTickers: tickers,
      hasInsufficientData: true,
      newsDataUnavailable: false,
      apiFailed: true,
    }
  }
}

/**
 * Initial homepage load: max 5 tickers, news mentions only, low priority.
 */
let inFlightInitialFetch = null

export async function getWeeklyTrendingInitial(limit = INITIAL_TRENDING_COUNT) {
  if (inFlightInitialFetch) {
    devLogWeekly('reusing in-flight initial fetch', null)
    return inFlightInitialFetch
  }

  inFlightInitialFetch = (async () => {
    const cached = readWeeklyTrendingCache() ?? readWeeklyTrendingCacheStale()
    const tickers = getInitialWeeklyTickers(limit)

    try {
      const fresh = await fetchWeeklyTrendingMentions(tickers, limit)
      const resolved = resolveWeeklyTrendingUpdate([], fresh, cached)

      if (resolved.shouldWriteCache) {
        writeWeeklyTrendingCache({
          stocks: resolved.stocks,
          hasInsufficientData: resolved.hasInsufficientData,
          newsDataUnavailable: resolved.newsDataUnavailable,
        })
      }

      return {
        stocks: resolved.stocks,
        hasInsufficientData: resolved.hasInsufficientData,
        newsDataUnavailable: resolved.newsDataUnavailable,
      }
    } catch (error) {
      logError('trendingService', error)
      const cachedStocks = filterMentionRankedStocks(cached?.stocks ?? [])
      if (cachedStocks.length > 0) {
        return { stocks: cachedStocks, hasInsufficientData: false, newsDataUnavailable: false }
      }
      return { stocks: [], hasInsufficientData: true, newsDataUnavailable: false }
    } finally {
      inFlightInitialFetch = null
    }
  })()

  return inFlightInitialFetch
}

/**
 * Expanded load after delay/interaction: remaining tickers, news mentions only.
 */
let inFlightExpandedFetch = null

export async function getWeeklyTrendingExpanded(limit = 10, currentStocks = []) {
  if (inFlightExpandedFetch) {
    devLogWeekly('reusing in-flight expanded fetch', null)
    return inFlightExpandedFetch
  }

  inFlightExpandedFetch = (async () => {
    const cached = readWeeklyTrendingCache() ?? readWeeklyTrendingCacheStale()
    const exclude = currentStocks.map((stock) => stock.symbol)
    const tickers = getExpandedWeeklyTickers(exclude)

    if (tickers.length === 0) {
      const validCurrent = filterMentionRankedStocks(currentStocks)
      return {
        stocks: validCurrent.slice(0, limit),
        hasInsufficientData: validCurrent.length === 0,
        newsDataUnavailable: false,
      }
    }

    try {
      const newResults = await fetchMentionTickersSequential(tickers, { priority: 'low' })
      const ranked = mergeTrendingResults(currentStocks, newResults, limit)
      const resolved = resolveWeeklyTrendingUpdate(currentStocks, ranked, cached)

      if (resolved.shouldWriteCache) {
        writeWeeklyTrendingCache({
          stocks: resolved.stocks,
          hasInsufficientData: resolved.hasInsufficientData,
          newsDataUnavailable: resolved.newsDataUnavailable,
        })
      }

      return {
        stocks: resolved.stocks,
        hasInsufficientData: resolved.hasInsufficientData,
        newsDataUnavailable: resolved.newsDataUnavailable,
      }
    } catch (error) {
      logError('trendingService', error)
      const validCurrent = filterMentionRankedStocks(currentStocks)
      if (validCurrent.length > 0) {
        return { stocks: validCurrent, hasInsufficientData: false, newsDataUnavailable: false }
      }
      const cachedStocks = filterMentionRankedStocks(cached?.stocks ?? [])
      if (cachedStocks.length > 0) {
        return { stocks: cachedStocks, hasInsufficientData: false, newsDataUnavailable: false }
      }
      return { stocks: [], hasInsufficientData: true, newsDataUnavailable: false }
    } finally {
      inFlightExpandedFetch = null
    }
  })()

  return inFlightExpandedFetch
}

export { INITIAL_LOAD_DELAY_MS, EXPANDED_LOAD_DELAY_MS }
