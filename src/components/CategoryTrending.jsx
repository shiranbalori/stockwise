import { TRENDING_DISCLAIMER } from '../data/stockCategories'

export default function CategoryTrending({
  stocks,
  loading,
  hasInsufficientData,
  onAnalyze,
  analyzeLoading,
}) {
  return (
    <div className="sw-highlight mb-6 mt-6 p-5">
      <h4 className="text-base font-semibold text-[#F8FAFC]">
        המניות הכי מדוברות בתחום
      </h4>
      <p className="mt-1.5 text-xs sw-text-muted">{TRENDING_DISCLAIMER}</p>

      {loading && (
        <div className="mt-5 flex items-center gap-3 text-sm sw-text-secondary">
          <div className="sw-spinner h-5 w-5" />
          מחשב דירוג עניין תקשורתי…
        </div>
      )}

      {!loading && hasInsufficientData && (
        <p className="mt-5 text-sm sw-text-secondary">אין מספיק נתונים עדכניים</p>
      )}

      {!loading && !hasInsufficientData && stocks.length > 0 && (
        <ul className="mt-5 space-y-3">
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
                        <span className="text-xs font-medium sw-text-muted">#{index + 1}</span>
                        <span className="truncate text-sm font-semibold text-[#F8FAFC]">{stock.name}</span>
                        <span className="text-sm font-semibold text-[#60A5FA]" dir="ltr">
                          {stock.symbol}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sw-text-secondary">
                        {stock.price != null && (
                          <span dir="ltr">${stock.price.toFixed(2)}</span>
                        )}
                        {stock.changePercent != null && (
                          <span
                            className={isPositive ? 'text-[#22C55E]' : 'text-red-400'}
                            dir="ltr"
                          >
                            {isPositive ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        )}
                        <span>{stock.newsCount} אזכורים ב-7 ימים</span>
                        <span>
                          רגש: {stock.sentimentDetail ?? stock.sentimentLabel}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-center">
                      <div className="rounded-lg bg-[#243447] px-2.5 py-1 border border-[rgba(148,163,184,0.12)]">
                        <span className="text-lg font-semibold text-[#60A5FA]">{stock.interestScore}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] sw-text-muted">ציון עניין</p>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
