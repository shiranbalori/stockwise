import { useNavigate, useLocation } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import AuthPlaceholder from '../components/AuthPlaceholder'
import WeeklyTrendingStocks from '../components/WeeklyTrendingStocks'
import { getAvailableTickers } from '../services/stockApi'
import { useAuth } from '../hooks/useAuth'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { stockPath, saveReturnPath } from '../utils/navigation'

export default function SearchPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, loading: authLoading, error: authError, signIn, signOut, isFirebaseConfigured } = useAuth()
  const { history } = useSearchHistory(user?.uid)

  function openStock(symbol) {
    saveReturnPath(`${location.pathname}${location.search}`)
    navigate(stockPath(symbol), { state: { from: `${location.pathname}${location.search}` } })
  }

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-1">
          <SearchBar
            onSearch={openStock}
            suggestedTickers={getAvailableTickers()}
            recentSearches={history}
            loading={false}
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

        <div className="hidden lg:col-span-2 lg:flex">
          <div className="sw-card flex h-full min-h-72 w-full flex-col items-center justify-center p-10 text-center">
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
        </div>
      </div>

      <div className="mt-12">
        <WeeklyTrendingStocks onAnalyze={openStock} analyzeLoading={false} />
      </div>
    </>
  )
}
