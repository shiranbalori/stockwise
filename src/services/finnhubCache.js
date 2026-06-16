import { MESSAGES } from '../constants/messages'

export const FINNHUB_CACHE_TTL_MS = 15 * 60 * 1000
export const FINNHUB_RATE_LIMIT_COOLDOWN_MS = 60 * 1000
const LS_PREFIX = 'stockwise_fh_'

export class FinnhubRateLimitError extends Error {
  constructor(message = MESSAGES.rateLimit) {
    super(message)
    this.name = 'FinnhubRateLimitError'
  }
}

const memoryCache = new Map()
const inFlightRequests = new Map()
let activeSearchRequests = 0
let rateLimitedUntil = 0

export function markSearchStart() {
  activeSearchRequests++
}

export function markSearchEnd() {
  activeSearchRequests = Math.max(0, activeSearchRequests - 1)
}

export function isFinnhubRateLimited() {
  return Date.now() < rateLimitedUntil
}

export function markFinnhubRateLimited() {
  rateLimitedUntil = Date.now() + FINNHUB_RATE_LIMIT_COOLDOWN_MS
}

export function buildFinnhubCacheKey(path, params = {}) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return `${path}?${sorted}`
}

function isExpired(entry) {
  return !entry || Date.now() - entry.timestamp > FINNHUB_CACHE_TTL_MS
}

function readStorage(key) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw)
    if (isExpired(entry)) {
      localStorage.removeItem(LS_PREFIX + key)
      return null
    }
    return entry
  } catch {
    return null
  }
}

function writeStorage(key, entry) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry))
  } catch {
    // ignore quota errors
  }
}

export function getFinnhubCached(key) {
  const mem = memoryCache.get(key)
  if (mem && !isExpired(mem)) {
    return mem.data
  }
  if (mem) {
    memoryCache.delete(key)
  }

  const stored = readStorage(key)
  if (stored) {
    memoryCache.set(key, stored)
    return stored.data
  }

  return undefined
}

export function setFinnhubCached(key, data) {
  const entry = { data, timestamp: Date.now() }
  memoryCache.set(key, entry)
  writeStorage(key, entry)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitForSearchPriority(priority) {
  if (priority === 'high') return

  while (activeSearchRequests > 0) {
    await sleep(50)
  }

  if (priority === 'low') {
    await sleep(300)
  }
}

export async function withFinnhubCache(key, fetchFn, { priority = 'normal' } = {}) {
  const cached = getFinnhubCached(key)
  if (cached !== undefined) {
    return cached
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const promise = (async () => {
    await waitForSearchPriority(priority)

    const cachedAfterWait = getFinnhubCached(key)
    if (cachedAfterWait !== undefined) {
      return cachedAfterWait
    }

    if (priority !== 'high' && isFinnhubRateLimited()) {
      return null
    }

    return fetchFn()
  })()

  inFlightRequests.set(key, promise)

  try {
    const data = await promise
    if (data !== null && data !== undefined) {
      setFinnhubCached(key, data)
    }
    return data
  } finally {
    inFlightRequests.delete(key)
  }
}
