import { logError } from '../constants/messages'

const DEFAULT_BASE_URL = 'https://api.twelvedata.com'
const PLACEHOLDER_PREFIX = 'your_'

const CHART_RANGE_CONFIG = {
  '10d': { label: '10 ימים', interval: '1day', outputsize: 10 },
  '1m': { label: 'חודש', interval: '1day', outputsize: 30 },
  '1y': { label: 'שנה', interval: '1week', outputsize: 52 },
  '5y': { label: '5 שנים', interval: '1month', outputsize: 60 },
}

const WEEKLY_GAIN_OUTPUT_SIZE = 8

export const CHART_RANGES = Object.entries(CHART_RANGE_CONFIG).map(([id, config]) => ({
  id,
  label: config.label,
}))

function readEnv(name) {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEnvValue(value) {
  return value.length > 0 && !value.startsWith(PLACEHOLDER_PREFIX)
}

export function isTwelveDataConfigured() {
  return isValidEnvValue(readEnv('VITE_TWELVE_DATA_API_KEY'))
}

function getApiKey() {
  return readEnv('VITE_TWELVE_DATA_API_KEY')
}

function getBaseUrl() {
  const baseUrl = readEnv('VITE_TWELVE_DATA_BASE_URL')
  return baseUrl || DEFAULT_BASE_URL
}

function devLogTwelveData(label, payload) {
  if (import.meta.env.DEV) {
    console.debug(`[Twelve Data] ${label}`, payload)
  }
}

function parseDatetime(value) {
  if (!value) return null
  const ms = Date.parse(value.replace(' ', 'T'))
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null
}

function parseTimeSeriesResponse(data) {
  if (!data || data.status === 'error') return null
  if (!Array.isArray(data.values) || data.values.length <= 1) return null

  const chronological = [...data.values].reverse()
  const closes = []
  const timestamps = []

  for (const bar of chronological) {
    const close = Number.parseFloat(bar.close)
    const timestamp = parseDatetime(bar.datetime)
    if (!Number.isFinite(close) || close <= 0 || timestamp == null) continue
    closes.push(close)
    timestamps.push(timestamp)
  }

  if (closes.length <= 1) return null

  return { closes, timestamps }
}

async function fetchTimeSeries(symbol, rangeKey) {
  const config = CHART_RANGE_CONFIG[rangeKey]
  if (!config || !isTwelveDataConfigured()) return null

  const url = new URL(`${getBaseUrl()}/time_series`)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('interval', config.interval)
  url.searchParams.set('outputsize', String(config.outputsize))
  url.searchParams.set('apikey', getApiKey())

  let response
  try {
    response = await fetch(url.toString())
  } catch (error) {
    logError('twelveDataProvider', error)
    devLogTwelveData(`time_series:${symbol}:${rangeKey}`, { error: error.message, type: 'network' })
    return null
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  devLogTwelveData(`time_series:${symbol}:${rangeKey}`, { status: response.status, data })

  if (!response.ok) return null

  return parseTimeSeriesResponse(data)
}

/**
 * Fetches historical closing prices for a chart timeframe via Twelve Data.
 * Returns null when no valid time series data is available.
 */
export async function fetchHistoricalCandles(symbol, rangeKey) {
  return fetchTimeSeries(symbol, rangeKey)
}

/**
 * Calculates 7-day percentage gain from daily closes (Twelve Data).
 * Returns null when historical data is unavailable.
 */
export async function fetchWeeklyPriceChange(symbol) {
  if (!isTwelveDataConfigured()) return null

  const url = new URL(`${getBaseUrl()}/time_series`)
  url.searchParams.set('symbol', symbol)
  url.searchParams.set('interval', '1day')
  url.searchParams.set('outputsize', String(WEEKLY_GAIN_OUTPUT_SIZE))
  url.searchParams.set('apikey', getApiKey())

  let response
  try {
    response = await fetch(url.toString())
  } catch (error) {
    logError('twelveDataProvider', error)
    devLogTwelveData(`weekly_gain:${symbol}`, { error: error.message, type: 'network' })
    return null
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  devLogTwelveData(`weekly_gain:${symbol}`, { status: response.status, data })

  if (!response.ok) return null

  const parsed = parseTimeSeriesResponse(data)
  if (!parsed) return null

  const baseline = parsed.closes[0]
  const latestClose = parsed.closes[parsed.closes.length - 1]
  if (baseline <= 0 || latestClose <= 0) return null

  return {
    weeklyGainPercent: ((latestClose - baseline) / baseline) * 100,
    latestClose,
  }
}
