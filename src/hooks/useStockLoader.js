import { useState, useEffect } from 'react'
import { getStockData } from '../services/stockApi'
import { markSearchStart, markSearchEnd } from '../services/finnhubCache'

export function useStockLoader(symbol) {
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(null)

  useEffect(() => {
    const normalized = symbol?.trim().toUpperCase()
    if (!normalized) {
      setLoading(false)
      setNotFound(null)
      setError(null)
      setStock(null)
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setNotFound(null)
      setStock(null)

      markSearchStart()
      try {
        const result = await getStockData(normalized)

        if (cancelled) return

        if (result.notFound) {
          setNotFound(normalized)
          return
        }

        if (result.error) {
          setError(result.error)
          return
        }

        if (result.stock) {
          setStock(result.stock)
        }
      } finally {
        markSearchEnd()
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [symbol])

  return { stock, loading, error, notFound }
}
