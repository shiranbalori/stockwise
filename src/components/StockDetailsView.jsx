import StockDashboard from './StockDashboard'
import { MESSAGES } from '../constants/messages'
import { getAvailableTickers, isStockApiConfigured } from '../services/stockApi'

export default function StockDetailsView({
  loading,
  error,
  notFound,
  stock,
  isFavorite,
  onToggleFavorite,
  onBack,
}) {
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium sw-text-secondary transition hover:text-[#60A5FA]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        חזרה
      </button>

      {loading && (
        <div className="sw-card flex min-h-72 flex-col items-center justify-center p-10 text-center">
          <div className="sw-spinner h-10 w-10" />
          <p className="mt-5 text-sm font-medium sw-text-secondary">טוען נתוני מניה…</p>
        </div>
      )}

      {!loading && error && (
        <div className="sw-card border-red-500/25 bg-red-500/5 p-10 text-center">
          <p className="text-lg font-semibold text-red-300">שגיאה בטעינת הנתונים</p>
          <p className="mt-2 text-sm text-red-200/80">{error}</p>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="sw-card p-10 text-center">
          <p className="text-lg font-semibold text-[#F8FAFC]">{MESSAGES.tickerNotFound}</p>
          <p className="mt-2 text-sm sw-text-secondary">
            <span dir="ltr">{notFound}</span>
            {isStockApiConfigured() ? null : (
              <>
                {' · '}
                נתוני דמו זמינים עבור:{' '}
                <span dir="ltr">{getAvailableTickers().join(', ')}</span>
              </>
            )}
          </p>
        </div>
      )}

      {!loading && !error && stock && (
        <StockDashboard
          stock={stock}
          isFavorite={isFavorite(stock.symbol)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  )
}
