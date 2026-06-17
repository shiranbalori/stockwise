import { useState, useEffect } from 'react'
import { getCategoryTrending } from '../services/trendingService'
import { getCategoryById } from '../data/stockCategories'

export function useCategoryTrending(categoryId) {
  const [trendingStocks, setTrendingStocks] = useState([])
  const [sortedTickers, setSortedTickers] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasInsufficientData, setHasInsufficientData] = useState(false)
  const [newsDataUnavailable, setNewsDataUnavailable] = useState(false)

  useEffect(() => {
    const category = categoryId ? getCategoryById(categoryId) : null
    if (!category) {
      setTrendingStocks([])
      setSortedTickers([])
      setHasInsufficientData(false)
      setNewsDataUnavailable(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    getCategoryTrending(category.tickers).then((result) => {
      if (cancelled) return
      setTrendingStocks(result.stocks)
      setSortedTickers(result.sortedTickers)
      setHasInsufficientData(result.hasInsufficientData)
      setNewsDataUnavailable(Boolean(result.newsDataUnavailable))
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  return { trendingStocks, sortedTickers, loading, hasInsufficientData, newsDataUnavailable }
}
