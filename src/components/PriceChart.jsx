import { useState, useEffect } from 'react'
import {
  fetchHistoricalCandles,
  CHART_RANGES,
  isTwelveDataConfigured,
} from '../services/twelveDataProvider'

const NO_CHART_MSG = 'אין נתוני גרף זמינים כרגע עבור מניה זו.'
const LIVE_DATA_NOTE = 'המחיר והנתונים הבסיסיים עדיין מוצגים מנתוני Finnhub חיים.'
const CHART_SUBTITLE = 'נתוני מחיר היסטוריים מ-Twelve Data'

export default function PriceChart({ symbol, isPositive, isLive }) {
  const [selectedRange, setSelectedRange] = useState('10d')
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [unavailableRanges, setUnavailableRanges] = useState(() => new Set())

  useEffect(() => {
    setSelectedRange('10d')
    setUnavailableRanges(new Set())
  }, [symbol])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPoints([])

    async function loadChart() {
      if (!isTwelveDataConfigured()) {
        if (!cancelled) {
          setPoints([])
          setUnavailableRanges(new Set(CHART_RANGES.map((r) => r.id)))
          setLoading(false)
        }
        return
      }

      const candles = await fetchHistoricalCandles(symbol, selectedRange)
      if (cancelled) return

      if (candles?.closes?.length > 1) {
        setPoints(candles.closes)
        setUnavailableRanges((prev) => {
          const next = new Set(prev)
          next.delete(selectedRange)
          return next
        })
      } else {
        setPoints([])
        setUnavailableRanges((prev) => new Set(prev).add(selectedRange))
      }

      setLoading(false)
    }

    loadChart()

    return () => {
      cancelled = true
    }
  }, [symbol, selectedRange])

  const handleRangeChange = (rangeKey) => {
    if (unavailableRanges.has(rangeKey)) return
    setSelectedRange(rangeKey)
    setPoints([])
    setLoading(true)
  }

  const chartPositive =
    points.length >= 2 ? points[points.length - 1] >= points[0] : isPositive
  const strokeColor = chartPositive ? '#22C55E' : '#f87171'
  const gradientId = `chartGradient-${symbol}-${selectedRange}`

  const min = points.length ? Math.min(...points) : 0
  const max = points.length ? Math.max(...points) : 1
  const priceRange = max - min || 1
  const width = 100
  const height = 48

  const pathData =
    points.length > 1
      ? points
          .map((point, i) => {
            const x = (i / (points.length - 1)) * width
            const y = height - ((point - min) / priceRange) * (height - 8) - 4
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
          })
          .join(' ')
      : ''

  const activeLabel = CHART_RANGES.find((r) => r.id === selectedRange)?.label ?? ''
  const hasChart = points.length > 1 && Boolean(pathData)

  return (
    <div className="sw-card p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#F8FAFC]">גרף מחיר</h3>
          <p className="mt-1 text-xs sw-text-muted">
            {CHART_SUBTITLE}
            {activeLabel ? ` · ${activeLabel}` : ''}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {CHART_RANGES.map((rangeOption) => {
          const isActive = selectedRange === rangeOption.id
          const isUnavailable = unavailableRanges.has(rangeOption.id)

          return (
            <button
              key={rangeOption.id}
              type="button"
              disabled={isUnavailable}
              onClick={() => handleRangeChange(rangeOption.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isUnavailable
                  ? 'cursor-not-allowed border-[rgba(148,163,184,0.12)] bg-[#243447]/50 text-[#CBD5E1]/40'
                  : isActive
                    ? 'border-[#60A5FA] bg-[rgba(96,165,250,0.12)] text-[#60A5FA]'
                    : 'border-[rgba(148,163,184,0.2)] bg-[#243447] text-[#CBD5E1] hover:border-[rgba(96,165,250,0.35)] hover:text-[#F8FAFC]'
              }`}
            >
              {rangeOption.label}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="flex h-36 items-center justify-center">
          <div className="sw-spinner h-6 w-6" />
        </div>
      )}

      {!loading && hasChart && (
        <div className="relative h-36 w-full" dir="ltr">
          <svg
            key={`${symbol}-${selectedRange}-${points.length}-${points[0]}-${points[points.length - 1]}`}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
              fill={`url(#${gradientId})`}
            />
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {!loading && !hasChart && (
        <div className="py-3">
          <p className="text-sm sw-text-secondary">{NO_CHART_MSG}</p>
          {isLive && (
            <p className="mt-1.5 text-xs sw-text-muted">{LIVE_DATA_NOTE}</p>
          )}
        </div>
      )}
    </div>
  )
}
