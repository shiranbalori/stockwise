import { useState, useEffect } from 'react'
import { getCategoryWeeklyLeaders } from '../services/weeklyGainersService'
import { getCategoryById } from '../data/stockCategories'

export function useCategoryWeeklyLeaders(categoryId) {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasInsufficientData, setHasInsufficientData] = useState(false)

  useEffect(() => {
    const category = categoryId ? getCategoryById(categoryId) : null
    if (!category) {
      setStocks([])
      setHasInsufficientData(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    getCategoryWeeklyLeaders(category.tickers).then((result) => {
      if (cancelled) return
      setStocks(result.stocks)
      setHasInsufficientData(result.hasInsufficientData)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  return { stocks, loading, hasInsufficientData }
}
