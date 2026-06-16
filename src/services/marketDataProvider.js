import { MESSAGES, logError } from '../constants/messages'
import { mapNewsArticle } from '../utils/news'
import {
  buildFinnhubCacheKey,
  withFinnhubCache,
  markFinnhubRateLimited,
  isFinnhubRateLimited,
  FinnhubRateLimitError,
} from './finnhubCache'

export {
  fetchHistoricalCandles,
  CHART_RANGES,
  isTwelveDataConfigured,
} from './twelveDataProvider'

export { FinnhubRateLimitError, isFinnhubRateLimited, markSearchStart, markSearchEnd } from './finnhubCache'

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

async function performFinnhubFetch(path, params, label, { priority = 'normal' } = {}) {
  const cacheKey = buildFinnhubCacheKey(path, params)
  const url = buildUrl(path, params)

  return withFinnhubCache(
    cacheKey,
    async () => {
      let response
      try {
        response = await fetch(url)
      } catch (error) {
        logError('marketDataProvider', error)
        devLogFinnhub(label, { error: error.message, type: 'network' })
        return null
      }

      let data = null
      try {
        data = await response.json()
      } catch {
        data = null
      }

      devLogFinnhub(label, { status: response.status, data })

      if (response.status === 429) {
        markFinnhubRateLimited()
        if (priority === 'high') {
          throw new FinnhubRateLimitError()
        }
        return null
      }

      if (!response.ok) {
        return null
      }

      if (data && typeof data === 'object' && data.error) {
        return null
      }

      return data
    },
    { priority },
  )
}

/**
 * Fetches a Finnhub endpoint with per-ticker caching (15 min).
 */
async function fetchFinnhubData(path, params, label, { priority = 'normal' } = {}) {
  try {
    return await performFinnhubFetch(path, params, label, { priority })
  } catch (error) {
    if (error instanceof FinnhubRateLimitError) {
      throw error
    }
    logError('marketDataProvider', error)
    return null
  }
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

async function fetchCompanyNewsRaw(symbol, daysBack = 30, { priority = 'normal' } = {}) {
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
    { priority },
  )

  return Array.isArray(data) ? data : []
}

async function fetchCompanyNewsArticles(symbol, limit = 5, { priority = 'high' } = {}) {
  try {
    const data = await fetchCompanyNewsRaw(symbol, 30, { priority })
    return data
      .slice(0, limit)
      .map(mapNewsArticle)
      .filter(Boolean)
  } catch (error) {
    if (error instanceof FinnhubRateLimitError) {
      throw error
    }
    return []
  }
}

async function fetchNewsSentiment(symbol, { priority = 'normal' } = {}) {
  try {
    const data = await fetchFinnhubData(
      '/news-sentiment',
      { symbol },
      `news-sentiment:${symbol}`,
      { priority },
    )

    if (!data || (!data.buzz && !data.sentiment && data.companyNewsScore == null)) {
      return null
    }

    return data
  } catch (error) {
    if (error instanceof FinnhubRateLimitError) {
      throw error
    }
    return null
  }
}

async function fetchQuoteSummary(symbol, { priority = 'low' } = {}) {
  const [quoteResult, profileResult] = await Promise.allSettled([
    fetchFinnhubData('/quote', { symbol }, `quote:${symbol}`, { priority }),
    fetchFinnhubData('/stock/profile2', { symbol }, `profile:${symbol}`, { priority }),
  ])

  if (quoteResult.status === 'rejected' && quoteResult.reason instanceof FinnhubRateLimitError) {
    throw quoteResult.reason
  }
  if (profileResult.status === 'rejected' && profileResult.reason instanceof FinnhubRateLimitError) {
    throw profileResult.reason
  }

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
    const data = await fetchFinnhubData('/news', { category: 'general' }, 'market-news', { priority: 'low' })
    if (!Array.isArray(data)) return []
    return data
      .slice(0, limit)
      .map(mapNewsArticle)
      .filter(Boolean)
  } catch {
    return []
  }
}

function devLogSearch(label, payload) {
  if (import.meta.env.DEV) {
    console.debug(`[Stock Search] ${label}`, payload)
  }
}

/**
 * Fetches complete stock data from Finnhub.
 * Returns null only when the ticker has no valid quote price and no valid profile.
 */
export async function fetchFinnhubStock(symbol) {
  let quote = null
  let profile = null

  try {
    const [quoteResult, profileResult] = await Promise.allSettled([
      fetchFinnhubData('/quote', { symbol }, `quote:${symbol}`, { priority: 'high' }),
      fetchFinnhubData('/stock/profile2', { symbol }, `profile:${symbol}`, { priority: 'high' }),
    ])

    if (quoteResult.status === 'rejected') {
      throw quoteResult.reason
    }
    if (profileResult.status === 'rejected') {
      throw profileResult.reason
    }

    quote = quoteResult.value
    profile = profileResult.value
  } catch (error) {
    if (error instanceof FinnhubRateLimitError) {
      throw error
    }
    logError('marketDataProvider', error)
  }

  const price = getQuotePrice(quote)
  const hasProfile = isProfileValid(profile)

  devLogSearch('quote result', { symbol, quote, price })
  devLogSearch('profile result', { symbol, profile, hasProfile })

  if (price == null && !hasProfile) {
    if (isFinnhubRateLimited()) {
      throw new FinnhubRateLimitError()
    }
    return null
  }

  let newsArticles = []
  try {
    newsArticles = await fetchCompanyNewsArticles(symbol, 5, { priority: 'high' })
  } catch (error) {
    if (error instanceof FinnhubRateLimitError) {
      // Quote/profile succeeded — show stock without news rather than failing search.
      newsArticles = []
    }
  }

  const { change, changePercent } = extractQuoteChange(quote)

  return {
    symbol: (profile?.ticker || symbol).toUpperCase(),
    name: profile?.name || symbol,
    price: price ?? 0,
    change: price != null ? change : 0,
    changePercent: price != null ? changePercent : 0,
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
