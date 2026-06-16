import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StockDetailsView from '../components/StockDetailsView'
import { useStockLoader } from '../hooks/useStockLoader'
import { useAuth } from '../hooks/useAuth'
import { useFavorites } from '../hooks/useFavorites'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { getReturnPath } from '../utils/navigation'

export default function StockPage() {
  const { symbol = '' } = useParams()
  const navigate = useNavigate()
  const { stock, loading, error, notFound } = useStockLoader(symbol)

  const { user } = useAuth()
  const { addFavorite, removeFavoriteBySymbol, isFavorite } = useFavorites(user?.uid)
  const { recordSearch } = useSearchHistory(user?.uid)

  useEffect(() => {
    if (stock?.symbol) {
      recordSearch(stock.symbol)
    }
  }, [stock?.symbol, recordSearch])

  async function handleToggleFavorite(stockData) {
    if (isFavorite(stockData.symbol)) {
      await removeFavoriteBySymbol(stockData.symbol)
    } else {
      await addFavorite(stockData)
    }
  }

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1)
      return
    }
    navigate(getReturnPath())
  }

  return (
    <StockDetailsView
      loading={loading}
      error={error}
      notFound={notFound}
      stock={stock}
      isFavorite={isFavorite}
      onToggleFavorite={handleToggleFavorite}
      onBack={handleBack}
    />
  )
}
