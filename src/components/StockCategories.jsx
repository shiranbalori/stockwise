import { STOCK_CATEGORIES, CATEGORIES_DISCLAIMER, getCategoryById } from '../data/stockCategories'
import { useCategoryTrending } from '../hooks/useCategoryTrending'
import { useCategoryWeeklyLeaders } from '../hooks/useCategoryWeeklyLeaders'
import CategoryTrending from './CategoryTrending'
import CategoryWeeklyLeaders from './CategoryWeeklyLeaders'

export default function StockCategories({
  selectedCategoryId,
  onSelectCategory,
  onAnalyze,
  loading,
}) {
  const selectedCategory = selectedCategoryId ? getCategoryById(selectedCategoryId) : null
  const {
    trendingStocks,
    sortedTickers,
    loading: trendingLoading,
    hasInsufficientData,
  } = useCategoryTrending(selectedCategoryId)

  const {
    stocks: weeklyLeaderStocks,
    loading: weeklyLeadersLoading,
    hasInsufficientData: weeklyLeadersInsufficient,
  } = useCategoryWeeklyLeaders(selectedCategoryId)

  const displayTickers = selectedCategory
    ? sortedTickers.length > 0
      ? sortedTickers
      : selectedCategory.tickers
    : []

  return (
    <section className="sw-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="sw-section-title text-2xl">מניות לפי תחומים</h2>
        <p className="sw-section-subtitle text-xs">{CATEGORIES_DISCLAIMER}</p>
      </div>

      {!selectedCategory ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STOCK_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              disabled={loading}
              onClick={() => onSelectCategory(category.id)}
              className="sw-card-inner p-4 text-start transition hover:border-[rgba(96,165,250,0.35)] hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <h3 className="text-sm font-semibold text-[#F8FAFC]">{category.title}</h3>
              <p className="mt-2 text-xs sw-text-muted" dir="ltr">
                {category.tickers.slice(0, 4).join(', ')}
                {category.tickers.length > 4 ? '…' : ''}
              </p>
              <p className="mt-2 text-xs text-[#60A5FA]">
                {category.tickers.length} מניות לדוגמה
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="mb-6 flex items-center gap-1 text-xs sw-text-secondary transition hover:text-[#60A5FA]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            חזרה לכל התחומים
          </button>

          <h3 className="text-lg font-semibold text-[#F8FAFC]">{selectedCategory.title}</h3>
          <p className="mt-2 text-xs sw-text-muted">
            בחרו מניה לניתוח לימודי — {CATEGORIES_DISCLAIMER}
          </p>

          <CategoryTrending
            stocks={trendingStocks}
            loading={trendingLoading}
            hasInsufficientData={hasInsufficientData}
            onAnalyze={onAnalyze}
            analyzeLoading={loading}
          />

          <p className="mb-4 text-xs font-medium sw-text-muted">כל המניות בתחום (ממוין לפי עניין תקשורתי)</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayTickers.map((ticker) => (
              <button
                key={ticker}
                type="button"
                disabled={loading}
                onClick={() => onAnalyze(ticker)}
                className="sw-card-inner flex items-center justify-between px-4 py-3 transition hover:border-[rgba(96,165,250,0.35)] hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-sm font-semibold text-[#60A5FA]" dir="ltr">
                  {ticker}
                </span>
                <span className="text-xs sw-text-muted">ניתוח ←</span>
              </button>
            ))}
          </div>

          <CategoryWeeklyLeaders
            stocks={weeklyLeaderStocks}
            loading={weeklyLeadersLoading}
            hasInsufficientData={weeklyLeadersInsufficient}
            onAnalyze={onAnalyze}
            analyzeLoading={loading}
          />
        </div>
      )}
    </section>
  )
}
