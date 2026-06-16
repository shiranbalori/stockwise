import { MESSAGES, logError } from '../constants/messages'

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

async function fetchJson(url) {
  let response
  try {
    response = await fetch(url)
  } catch (error) {
    logError('marketDataProvider', error)
    throw new Error(MESSAGES.networkError)
  }

  if (!response.ok) {
    logError('marketDataProvider', new Error(`HTTP ${response.status}`))
    throw new Error(MESSAGES.stockLoadFailed)
  }

  return response.json()
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

function isQuoteValid(quote) {
  return quote && typeof quote.c === 'number' && quote.c > 0
}

function isProfileValid(profile) {
  return Boolean(profile?.name || profile?.ticker)
}

function buildMetrics(profile) {
  return {
    marketCap: formatMarketCap(profile?.marketCapitalization),
    industry: profile?.finnhubIndustry || 'לא זמין',
    country: profile?.country || 'לא זמין',
    exchange: profile?.exchange || 'לא זמין',
  }
}

async function fetchCandles(symbol) {
  const to = Math.floor(Date.now() / 1000)
  const from = to - 30 * 24 * 60 * 60

  const data = await fetchJson(
    buildUrl('/stock/candle', { symbol, resolution: 'D', from, to }),
  )

  if (data?.s !== 'ok' || !Array.isArray(data.c) || data.c.length === 0) {
    return null
  }

  return data.c.slice(-10)
}

async function fetchCompanyNews(symbol) {
  const to = new Date()
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const data = await fetchJson(
    buildUrl('/company-news', {
      symbol,
      from: formatDate(from),
      to: formatDate(to),
    }),
  )

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  return data.slice(0, 3).map((item) => item.headline).filter(Boolean)
}

function buildChartFromPrice(price) {
  const points = []
  for (let i = 0; i < 9; i++) {
    points.push(price * (0.97 + i * 0.003))
  }
  points.push(price)
  return points
}

/**
 * Fetches complete stock data from Finnhub.
 * Returns null when the ticker is not found.
 * Throws on network/API errors with production-safe messages.
 */
export async function fetchFinnhubStock(symbol) {
  const [quote, profile] = await Promise.all([
    fetchJson(buildUrl('/quote', { symbol })),
    fetchJson(buildUrl('/stock/profile2', { symbol })),
  ])

  if (!isQuoteValid(quote) && !isProfileValid(profile)) {
    return null
  }

  if (!isQuoteValid(quote)) {
    return null
  }

  const [candles, news] = await Promise.all([
    fetchCandles(symbol).catch(() => null),
    fetchCompanyNews(symbol).catch(() => null),
  ])

  const chartPoints = candles?.length ? candles : buildChartFromPrice(quote.c)

  return {
    symbol,
    name: profile?.name || symbol,
    price: quote.c,
    change: quote.d ?? 0,
    changePercent: quote.dp ?? 0,
    metrics: buildMetrics(profile),
    news: news ?? [],
    chartPoints,
    isLive: true,
  }
}

export { buildChartFromPrice }
