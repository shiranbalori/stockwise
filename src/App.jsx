import { useState, useEffect } from 'react'
import Header from './components/Header'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import StockDashboard from './components/StockDashboard'
import FavoritesList from './components/FavoritesList'
import AuthPlaceholder from './components/AuthPlaceholder'
import StockCategories from './components/StockCategories'
import NewsPage from './components/NewsPage'
import { getStockData, getAvailableTickers, isStockApiConfigured } from './services/stockApi'
import { MESSAGES } from './constants/messages'
import { useAuth } from './hooks/useAuth'
import { useFavorites } from './hooks/useFavorites'
import { useSearchHistory } from './hooks/useSearchHistory'

function App() {
  const [activeView, setActiveView] = useState('search')
  const [stock, setStock] = useState(null)
  const [notFound, setNotFound] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  const { user, loading: authLoading, error: authError, signIn, signOut, isFirebaseConfigured } = useAuth()
  const { favorites, addFavorite, removeFavoriteBySymbol, isFavorite } = useFavorites(user?.uid)
  const { history, recordSearch } = useSearchHistory(user?.uid)

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    const scrollTop = () => window.scrollTo(0, 0)
    scrollTop()
    requestAnimationFrame(scrollTop)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeView])

  async function handleSearch(symbol) {
    setActiveView('search')
    window.scrollTo(0, 0)
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

  function handleNavigate(view) {
    setActiveView(view)
    window.scrollTo(0, 0)
    if (view === 'categories') {
      setSelectedCategoryId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Header />
      <TopNav activeView={activeView} onChange={handleNavigate} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {activeView === 'search' && (
          <>
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-1">
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
              </div>

              <div className="lg:col-span-2">
                {loading && (
                  <div className="sw-card flex h-full min-h-72 flex-col items-center justify-center p-10 text-center">
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
                    <p className="text-lg font-semibold text-[#F8FAFC]">
                      {MESSAGES.tickerNotFound}
                    </p>
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

                {!loading && !error && !stock && !notFound && (
                  <div className="sw-card flex h-full min-h-72 flex-col items-center justify-center p-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#243447] border border-[rgba(148,163,184,0.15)]">
                      <svg
                        className="h-8 w-8 text-[#60A5FA]"
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
                    <h2 className="mt-5 text-xl font-semibold text-[#F8FAFC]">
                      חפשו מניה כדי להתחיל
                    </h2>
                    <p className="mt-2 max-w-sm text-sm sw-text-secondary">
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

            <div className="mt-12">
              <StockCategories
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onAnalyze={handleSearch}
                loading={loading}
              />
            </div>
          </>
        )}

        {activeView === 'categories' && (
          <StockCategories
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onAnalyze={handleSearch}
            loading={loading}
          />
        )}

        {activeView === 'news' && (
          <NewsPage onAnalyze={handleSearch} />
        )}

        {activeView === 'favorites' && (
          <div className="mx-auto max-w-2xl space-y-8">
            <div>
              <h2 className="sw-section-title text-2xl">מועדפים</h2>
              <p className="sw-section-subtitle">המניות ששמרתם לניתוח מהיר.</p>
            </div>
            <div className="sw-card p-5 sm:p-6">
            <FavoritesList
              favorites={favorites}
              onSelect={handleSearch}
              onRemove={removeFavoriteBySymbol}
            />
            </div>
            <AuthPlaceholder
              user={user}
              loading={authLoading}
              error={authError}
              signIn={signIn}
              signOut={signOut}
              isFirebaseConfigured={isFirebaseConfigured}
            />
          </div>
        )}

        <Footer />
      </main>
    </div>
  )
}

export default App
