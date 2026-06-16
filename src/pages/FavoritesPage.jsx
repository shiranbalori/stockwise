import { useNavigate, useLocation } from 'react-router-dom'
import FavoritesList from '../components/FavoritesList'
import AuthPlaceholder from '../components/AuthPlaceholder'
import { useAuth } from '../hooks/useAuth'
import { useFavorites } from '../hooks/useFavorites'
import { stockPath, saveReturnPath } from '../utils/navigation'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, loading: authLoading, error: authError, signIn, signOut, isFirebaseConfigured } = useAuth()
  const { favorites, removeFavoriteBySymbol } = useFavorites(user?.uid)

  function openStock(symbol) {
    saveReturnPath(`${location.pathname}${location.search}`)
    navigate(stockPath(symbol), { state: { from: `${location.pathname}${location.search}` } })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="sw-section-title text-2xl">מועדפים</h2>
        <p className="sw-section-subtitle">המניות ששמרתם לניתוח מהיר.</p>
      </div>
      <div className="sw-card p-5 sm:p-6">
        <FavoritesList
          favorites={favorites}
          onSelect={openStock}
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
  )
}
