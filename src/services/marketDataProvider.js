import { MESSAGES, logError } from '../constants/messages'
import { mapNewsArticle } from '../utils/news'
export {
  fetchHistoricalCandles,
  CHART_RANGES,
  isTwelveDataConfigured,
} from './twelveDataProvider'

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
