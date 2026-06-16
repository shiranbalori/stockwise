import { MESSAGES, logError } from '../constants/messages'
import { mapNewsArticle } from '../utils/news'

const DEFAULT_BASE_URL = 'https://finnhub.io/api/v1'
const PLACEHOLDER_PREFIX = 'your_'

export function isStockApiConfigured() {
  const apiKey = readEnv('VITE_STOCK_API_KEY')
  return isValidEnvValue(apiKey)
}

function readEnv(name) {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEnvValue(value) {
  return value.length > 0 && !value.startsWith(PLACEHOLDER_PREFIX)
}

function getApiKey() {
  return readEnv('VITE_STOCK_API_KEY')
}

function getBaseUrl() {
  const baseUrl = readEnv('VITE_STOCK_API_BASE_URL')
  return baseUrl || DEFAULT_BASE_URL
}

function buildUrl(path, params) {
  const url = new URL(`${getBaseUrl()}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })
  url.searchParams.set('token', getApiKey())
  return url.toString()
}

function devLogFinnhub(label, payload) {
  if (import.meta.env.DEV) {
    console.debug(`[Finnhub] ${label}`, payload)
  }
}

/**
 * Fetches a Finnhub endpoint. Returns null on HTTP/API errors.
 * Throws only on network failure when throwOnNetworkError is true.
 */
async function fetchFinnhubData(path, params, label, { throwOnNetworkError = false } = {}) {
  const url = buildUrl(path, params)

  let response
  try {
    response = await fetch(url)
  } catch (error) {
    logError('marketDataProvider', error)
    devLogFinnhub(label, { error: error.message, type: 'network' })
    if (throwOnNetworkError) {
      throw new Error(MESSAGES.networkError)
    }
    return null
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  devLogFinnhub(label, { status: response.status, data })

  if (!response.ok) {
    return null
  }

  if (data && typeof data === 'object' && data.error) {
    return null
  }

  return data
}

function formatMarketCap(valueInMillions) {
  if (!valueInMillions || valueInMillions <= 0) return 'לא זמין'
  if (valueInMillions >= 1_000_000) {
    return `$${(valueInMillions / 1_000_000).toFixed(2)}T`
  }
  if (valueInMillions >= 1_000) {
    return `$${(valueInMillions / 1_000).toFixed(2)}B`
  }
  return `$${valueInMillions.toFixed(2)}M`
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

function getQuotePrice(quote) {
  if (!quote) return null
  if (typeof quote.c === 'number' && quote.c > 0) return quote.c
  if (typeof quote.pc === 'number' && quote.pc > 0) return quote.pc
  return null
}

function extractQuoteChange(quote) {
  if (!quote) return { change: 0, changePercent: 0 }
  return {
    change: typeof quote.d === 'number' ? quote.d : 0,
    changePercent: typeof quote.dp === 'number' ? quote.dp : 0,
  }
}

function isProfileValid(profile) {
  return Boolean(profile?.name || profile?.ticker)
}

function buildMetrics(profile) {
  if (!isProfileValid(profile)) {
    return {
      marketCap: 'לא זמין',
      industry: 'לא זמין',
      country: 'לא זמין',
      exchange: 'לא זמין',
    }
  }

  return {
    marketCap: formatMarketCap(profile.marketCapitalization),
    industry: profile.finnhubIndustry || 'לא זמין',
    country: profile.country || 'לא זמין',
    exchange: profile.exchange || 'לא זמין',
  }
}

const CHART_RANGE_CONFIG = {
  '10d': { label: '10 ימים', days: 14, resolutions: ['D'] },
  '1m': { label: 'חודש', days: 45, resolutions: ['D'] },
  '1y': { label: 'שנה', days: 365, resolutions: ['W', 'D'] },
  '5y': { label: '5 שנים', days: 365 * 5, resolutions: ['M', 'W'] },
}

function parseCandleResponse(data) {
  if (data?.s !== 'ok') return null
  if (!Array.isArray(data.c) || !Array.isArray(data.t)) return null
  if (data.c.length <= 1 || data.t.length <= 1) return null
  if (data.c.length !== data.t.length) return null
  return { closes: data.c, timestamps: data.t }
}

/**
 * Fetches historical closing prices for a chart timeframe.
 * Returns null when Finnhub has no valid candle data for the range.
 */
export async function fetchHistoricalCandles(symbol, rangeKey) {
  const config = CHART_RANGE_CONFIG[rangeKey]
  if (!config) return null

  const to = Math.floor(Date.now() / 1000)
  const from = to - config.days * 24 * 60 * 60

  for (const resolution of config.resolutions) {
    const data = await fetchFinnhubData(
      '/stock/candle',
      { symbol, resolution, from, to },
      `candle:${symbol}:${rangeKey}:${resolution}`,
    )

    const parsed = parseCandleResponse(data)
    if (parsed) {
      if (rangeKey === '10d' && parsed.closes.length > 10) {
        const start = parsed.closes.length - 10
        return {
          closes: parsed.closes.slice(start),
          timestamps: parsed.timestamps.slice(start),
        }
      }
      return parsed
    }
  }

  return null
}

export const CHART_RANGES = Object.entries(CHART_RANGE_CONFIG).map(([id, config]) => ({
  id,
  label: config.label,
}))

async function fetchCompanyNewsRaw(symbol, daysBack = 30) {
  const to = new Date()
  const from = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

  const data = await fetchFinnhubData(
    '/company-news',
    {
      symbol,
      from: formatDate(from),
      to: formatDate(to),
    },
    `company-news:${symbol}`,
  )

  return Array.isArray(data) ? data : []
}

async function fetchCompanyNewsArticles(symbol, limit = 5) {
  try {
    const data = await fetchCompanyNewsRaw(symbol, 30)
    return data
      .slice(0, limit)
      .map(mapNewsArticle)
      .filter(Boolean)
  } catch {
    return []
  }
}

async function fetchNewsSentiment(symbol) {
  try {
    const data = await fetchFinnhubData(
      '/news-sentiment',
      { symbol },
      `news-sentiment:${symbol}`,
    )

    if (!data || (!data.buzz && !data.sentiment && data.companyNewsScore == null)) {
      return null
    }

    return data
  } catch {
    return null
  }
}

async function fetchQuoteSummary(symbol) {
  const [quoteResult, profileResult] = await Promise.allSettled([
    fetchFinnhubData('/quote', { symbol }, `quote:${symbol}`),
    fetchFinnhubData('/stock/profile2', { symbol }, `profile:${symbol}`),
  ])

  const quote = quoteResult.status === 'fulfilled' ? quoteResult.value : null
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null
  const price = getQuotePrice(quote)

  if (price == null) {
    return null
  }

  const { change, changePercent } = extractQuoteChange(quote)

  return {
    symbol,
    name: profile?.name || symbol,
    price,
    change,
    changePercent,
  }
}

async function fetchMarketNews(limit = 10) {
  try {
    const data = await fetchFinnhubData('/news', { category: 'general' }, 'market-news')
    if (!Array.isArray(data)) return []
    return data
      .slice(0, limit)
      .map(mapNewsArticle)
      .filter(Boolean)
  } catch {
    return []
  }
}

/**
 * Fetches complete stock data from Finnhub.
 * Returns null when the ticker is not found.
 * Throws only on network failure while fetching the quote.
 */
export async function fetchFinnhubStock(symbol) {
  const [quoteResult, profileResult] = await Promise.allSettled([
    fetchFinnhubData('/quote', { symbol }, `quote:${symbol}`, { throwOnNetworkError: true }),
    fetchFinnhubData('/stock/profile2', { symbol }, `profile:${symbol}`),
  ])

  if (quoteResult.status === 'rejected') {
    throw quoteResult.reason
  }

  const quote = quoteResult.value
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null
  const price = getQuotePrice(quote)
  const hasProfile = isProfileValid(profile)

  if (price == null && !hasProfile) {
    return null
  }

  if (price == null) {
    return null
  }

  const newsArticles = await fetchCompanyNewsArticles(symbol, 5).catch(() => [])

  const { change, changePercent } = extractQuoteChange(quote)

  return {
    symbol,
    name: profile?.name || symbol,
    price,
    change,
    changePercent,
    metrics: buildMetrics(profile),
    newsArticles: newsArticles ?? [],
    isLive: true,
  }
}

export {
  fetchCompanyNewsRaw,
  fetchCompanyNewsArticles,
  fetchMarketNews,
  fetchNewsSentiment,
  fetchQuoteSummary,
}
