import { useState, useEffect, useRef } from 'react'
import {
  getWeeklyTrendingInitial,
  getWeeklyTrendingExpanded,
  getInitialWeeklyTrendingState,
  readWeeklyTrendingCache,
  resolveWeeklyTrendingUpdate,
  INITIAL_LOAD_DELAY_MS,
  EXPANDED_LOAD_DELAY_MS,
} from '../services/trendingService'
import { TRENDING_DISCLAIMER } from '../data/stockCategories'

const WEEKLY_TRENDING_LIMIT = 10

function readCachedForMerge() {
  return readWeeklyTrendingCache()
}

function applyResolvedResult(resolved) {
  return {
    stocks: resolved.stocks,
    hasInsufficientData: resolved.stocks.length === 0 && resolved.hasInsufficientData,
    newsDataUnavailable: Boolean(resolved.newsDataUnavailable),
  }
}

export default function WeeklyTrendingStocks({ onAnalyze, analyzeLoading = false }) {
  const [initialState] = useState(() => getInitialWeeklyTrendingState())
  const [stocks, setStocks] = useState(initialState.stocks)
  const [loading, setLoading] = useState(initialState.loading)
  const [fetchComplete, setFetchComplete] = useState(false)
  const [hasInsufficientData, setHasInsufficientData] = useState(false)
  const [newsDataUnavailable, setNewsDataUnavailable] = useState(false)
  const stocksRef = useRef(stocks)
  const sectionRef = useRef(null)
  const expandedRef = useRef(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    stocksRef.current = stocks
  }, [stocks])

  useEffect(() => {
    if (mountedRef.current) return undefined
    mountedRef.current = true

    let cancelled = false
    let initialTimer
    let expandedTimer

    const runExpanded = async () => {
      if (cancelled || expandedRef.current) return
      expandedRef.current = true

      try {
        const result = await getWeeklyTrendingExpanded(WEEKLY_TRENDING_LIMIT, stocksRef.current)
        if (cancelled) return

        const cached = readCachedForMerge()
        const resolved = resolveWeeklyTrendingUpdate(stocksRef.current, result, cached)
        const next = applyResolvedResult(resolved)
        setStocks(next.stocks)
        setHasInsufficientData(next.hasInsufficientData)
        setNewsDataUnavailable(next.newsDataUnavailable)
      } catch {
        // keep current list on expanded failure
      }
    }

    const runInitial = async () => {
      try {
        const result = await getWeeklyTrendingInitial()
        if (cancelled) return

        const cached = readCachedForMerge()
        const resolved = resolveWeeklyTrendingUpdate(stocksRef.current, result, cached)
        const next = applyResolvedResult(resolved)
        setStocks(next.stocks)
        setHasInsufficientData(next.hasInsufficientData)
        setNewsDataUnavailable(next.newsDataUnavailable)
      } catch {
        if (cancelled) return
        const cached = readCachedForMerge()
        if (cached?.stocks?.length > 0) {
          setStocks(cached.stocks)
          setHasInsufficientData(false)
          setNewsDataUnavailable(false)
        } else if (stocksRef.current.length === 0) {
          setHasInsufficientData(true)
          setNewsDataUnavailable(false)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setFetchComplete(true)
        }
      }
    }

    initialTimer = setTimeout(() => {
      if (!cancelled) {
        runInitial()
      }
    }, INITIAL_LOAD_DELAY_MS)

    expandedTimer = setTimeout(() => {
      runExpanded()
    }, EXPANDED_LOAD_DELAY_MS)

    const section = sectionRef.current
    const onInteract = () => {
      runExpanded()
    }

    section?.addEventListener('mouseenter', onInteract, { once: true })
    section?.addEventListener('touchstart', onInteract, { once: true, passive: true })

    return () => {
      cancelled = true
      clearTimeout(initialTimer)
      clearTimeout(expandedTimer)
      section?.removeEventListener('mouseenter', onInteract)
      section?.removeEventListener('touchstart', onInteract)
    }
  }, [])

  const showEmptyMessage =
    fetchComplete && stocks.length === 0 && hasInsufficientData && !newsDataUnavailable

  const showNewsUnavailableMessage =
    fetchComplete && newsDataUnavailable

  return (
    <section ref={sectionRef} className="sw-card p-6 sm:p-8">
      <h2 className="sw-section-title text-2xl">מניות הכי מדוברות השבוע</h2>
      <p className="sw-section-subtitle text-xs">{TRENDING_DISCLAIMER}</p>

      {loading && stocks.length === 0 && (
        <div className="mt-6 flex items-center gap-3 text-sm sw-text-secondary">
          <div className="sw-spinner h-5 w-5" />
          טוען מניות מדוברות...
        </div>
      )}

      {showNewsUnavailableMessage && (
        <p className="mt-6 text-sm sw-text-secondary">
          לא ניתן לטעון כרגע נתוני אזכורים. נסו שוב מאוחר יותר.
        </p>
      )}

      {showEmptyMessage && (
        <p className="mt-6 text-sm sw-text-secondary">אין מספיק נתונים עדכניים</p>
      )}

      {stocks.length > 0 && (
        <ul className="mt-6 space-y-3">
          {stocks.map((stock, index) => {
            const isPositive = (stock.changePercent ?? 0) >= 0
            return (
              <li key={stock.symbol}>
                <button
                  type="button"
                  disabled={analyzeLoading}
                  onClick={() => onAnalyze(stock.symbol)}
                  className="sw-card-inner w-full p-4 text-start transition hover:border-[rgba(96,165,250,0.35)] hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sw-text-muted">#{index + 1}</span>
                        <span className="truncate text-sm font-semibold text-[#F8FAFC]">{stock.name}</span>
                        <span className="text-sm font-semibold text-[#60A5FA]" dir="ltr">
                          {stock.symbol}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sw-text-secondary">
                        {stock.price != null && <span dir="ltr">${stock.price.toFixed(2)}</span>}
                        {stock.changePercent != null && (
                          <span className={isPositive ? 'text-[#22C55E]' : 'text-red-400'} dir="ltr">
                            {isPositive ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        )}
                        <span>{stock.newsCount} אזכורי חדשות</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-center">
                      <div className="rounded-lg bg-[#243447] px-2.5 py-1 border border-[rgba(148,163,184,0.12)]">
                        <span className="text-lg font-semibold text-[#60A5FA]">{stock.interestScore}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] sw-text-muted">ציון אזכורים</p>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
