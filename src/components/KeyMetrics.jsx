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
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="text-sm font-semibold text-slate-200">נתוני מפתח</h3>
      <p className="mt-1 text-xs text-slate-500">
        {isLive ? 'נתונים חיים מ-Finnhub' : 'נתוני גיבוי למטרות לימוד'}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5"
          >
            <dt className="text-xs text-slate-500">{METRIC_LABELS[key] ?? key}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-white" dir="ltr">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
