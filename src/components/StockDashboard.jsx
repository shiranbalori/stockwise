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
    <div className="space-y-6">
      <div className="sw-card p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="rounded-lg bg-[#243447] px-2.5 py-1 text-sm font-bold text-[#60A5FA] border border-[rgba(148,163,184,0.15)]"
                dir="ltr"
              >
                {stock.symbol}
              </span>
              <h2 className="text-xl font-bold text-[#F8FAFC]">{stock.name}</h2>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-4">
              <div>
                <p className="text-xs sw-text-muted">מחיר נוכחי</p>
                <span className="text-3xl font-bold text-[#F8FAFC]" dir="ltr">
                  ${stock.price.toFixed(2)}
                </span>
              </div>
              <div>
                <p className="text-xs sw-text-muted">שינוי יומי</p>
                <span
                  className={`text-sm font-semibold ${isPositive ? 'text-[#22C55E]' : 'text-red-400'}`}
                  dir="ltr"
                >
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </div>
              <span className="self-end text-xs sw-text-muted">
                {isLive ? 'Finnhub' : 'נתוני גיבוי'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(stock)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              isFavorite
                ? 'border-rose-400/35 bg-rose-400/10 text-rose-300'
                : 'border-[rgba(148,163,184,0.2)] bg-[#243447] text-[#CBD5E1] hover:border-rose-400/30 hover:text-rose-300'
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

        <div className="mt-5 flex flex-wrap gap-2">
          <RiskBadge level={stock.riskLevel} />
          <RatingBadge rating={stock.rating} />
        </div>
      </div>

      <PriceChart
        symbol={stock.symbol}
        isPositive={isPositive}
        isLive={isLive}
      />

      <KeyMetrics metrics={stock.metrics} isLive={isLive} />

      <NewsSummary articles={stock.newsArticles} isLive={isLive} />

      <AIAnalysis text={stock.aiAnalysis} />
    </div>
  )
}
