const METRIC_LABELS = {
  marketCap: 'שווי שוק',
  industry: 'תעשייה',
  country: 'מדינה',
  exchange: 'בורסה',
  peRatio: 'מכפיל רווח (P/E)',
  eps: 'רווח למניה (EPS)',
  dividendYield: 'תשואת דיבידנד',
  week52High: 'שיא 52 שבועות',
  week52Low: 'שפל 52 שבועות',
  volume: 'נפח מסחר',
}

const METRIC_ORDER = ['marketCap', 'industry', 'country', 'exchange', 'peRatio', 'eps', 'dividendYield', 'week52High', 'week52Low', 'volume']

export default function KeyMetrics({ metrics, isLive }) {
  const entries = METRIC_ORDER
    .filter((key) => metrics[key] !== undefined)
    .map((key) => [key, metrics[key]])

  return (
    <div className="sw-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[#F8FAFC]">נתוני מפתח</h3>
      <p className="mt-1 text-xs sw-text-muted">
        {isLive ? 'נתונים חיים מ-Finnhub' : 'נתוני גיבוי למטרות לימוד'}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="sw-card-inner px-3 py-3"
          >
            <dt className="text-xs sw-text-muted">{METRIC_LABELS[key] ?? key}</dt>
            <dd className="mt-1 text-sm font-semibold text-[#F8FAFC]" dir="ltr">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
