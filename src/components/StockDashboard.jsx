import PriceChart from './PriceChart'
import KeyMetrics from './KeyMetrics'
import NewsSummary from './NewsSummary'
import AIAnalysis from './AIAnalysis'
import RiskBadge from './RiskBadge'
import RatingBadge from './RatingBadge'

export default function StockDashboard({ stock, isFavorite, onToggleFavorite }) {
  const isPositive = stock.change >= 0
  const isLive = Boolean(stock.isLive)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="rounded-lg bg-indigo-600/20 px-2.5 py-1 text-sm font-bold text-indigo-300"
                dir="ltr"
              >
                {stock.symbol}
              </span>
              <h2 className="text-xl font-bold text-white">{stock.name}</h2>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <div>
                <p className="text-xs text-slate-500">מחיר נוכחי</p>
                <span className="text-3xl font-bold text-white" dir="ltr">
                  ${stock.price.toFixed(2)}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500">שינוי יומי</p>
                <span
                  className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
                  dir="ltr"
                >
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </div>
              <span className="self-end text-xs text-slate-500">
                {isLive ? 'Finnhub' : 'נתוני גיבוי'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(stock)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              isFavorite
                ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-pink-500/40 hover:text-pink-400'
            }`}
          >
            <svg
              className="h-5 w-5"
              fill={isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {isFavorite ? 'נשמר במועדפים' : 'שמור למועדפים'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <RiskBadge level={stock.riskLevel} />
          <RatingBadge rating={stock.rating} />
        </div>
      </div>

      <PriceChart points={stock.chartPoints} isPositive={isPositive} isLive={isLive} />

      <div className="grid gap-4 lg:grid-cols-2">
        <KeyMetrics metrics={stock.metrics} isLive={isLive} />
        <NewsSummary items={stock.news} isLive={isLive} />
      </div>

      <AIAnalysis text={stock.aiAnalysis} />
    </div>
  )
}
