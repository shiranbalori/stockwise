import { useState } from 'react'
import Header from './components/Header'
import Disclaimer from './components/Disclaimer'
import SearchBar from './components/SearchBar'
import StockDashboard from './components/StockDashboard'
import FavoritesList from './components/FavoritesList'
import AuthPlaceholder from './components/AuthPlaceholder'
import { getStockData, getAvailableTickers, isStockApiConfigured } from './services/stockApi'
import { MESSAGES } from './constants/messages'
import { useAuth } from './hooks/useAuth'
import { useFavorites } from './hooks/useFavorites'
import { useSearchHistory } from './hooks/useSearchHistory'

function App() {
  const [stock, setStock] = useState(null)
  const [notFound, setNotFound] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user, loading: authLoading, error: authError, signIn, signOut, isFirebaseConfigured } = useAuth()
  const { favorites, addFavorite, removeFavoriteBySymbol, isFavorite } = useFavorites(user?.uid)
  const { history, recordSearch } = useSearchHistory(user?.uid)

  async function handleSearch(symbol) {
    setLoading(true)
    setError(null)
    setNotFound(null)
    setStock(null)

    try {
      const result = await getStockData(symbol)

      if (result.notFound) {
        setNotFound(symbol.toUpperCase())
        return
      }

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.stock) {
        setStock(result.stock)
        await recordSearch(result.stock.symbol)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleFavorite(stockData) {
    if (isFavorite(stockData.symbol)) {
      await removeFavoriteBySymbol(stockData.symbol)
    } else {
      await addFavorite(stockData)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Disclaimer />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <SearchBar
              onSearch={handleSearch}
              suggestedTickers={getAvailableTickers()}
              recentSearches={history}
              loading={loading}
            />
            <AuthPlaceholder
              user={user}
              loading={authLoading}
              error={authError}
              signIn={signIn}
              signOut={signOut}
              isFirebaseConfigured={isFirebaseConfigured}
            />
            <FavoritesList
              favorites={favorites}
              onSelect={handleSearch}
              onRemove={removeFavoriteBySymbol}
            />
          </div>

          <div className="lg:col-span-2">
            {loading && (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-slate-300">טוען נתוני מניה…</p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <p className="text-lg font-semibold text-red-300">שגיאה בטעינת הנתונים</p>
                <p className="mt-2 text-sm text-red-200/80">{error}</p>
              </div>
            )}

            {!loading && !error && notFound && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <p className="text-lg font-semibold text-white">
                  הסימול &ldquo;<span dir="ltr">{notFound}</span>&rdquo; לא נמצא
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {isStockApiConfigured()
                    ? MESSAGES.tickerNotFound
                    : (
                      <>
                        נתוני דמו זמינים עבור:{' '}
                        <span dir="ltr">{getAvailableTickers().join(', ')}</span>
                      </>
                    )}
                </p>
              </div>
            )}

            {!loading && !error && !stock && !notFound && (
              <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20">
                  <svg
                    className="h-7 w-7 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">
                  חפשו מניה כדי להתחיל
                </h2>
                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  הזינו סימול מניה לצפייה בלוח ניתוח לימודי.
                </p>
              </div>
            )}

            {!loading && stock && (
              <StockDashboard
                stock={stock}
                isFavorite={isFavorite(stock.symbol)}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>Stock Insight AI · למטרות לימוד בלבד · אינו ייעוץ השקעות</p>
          <p className="mt-1 text-slate-600">{MESSAGES.disclaimerBody}</p>
        </footer>
      </main>
    </div>
  )
}

export default App
