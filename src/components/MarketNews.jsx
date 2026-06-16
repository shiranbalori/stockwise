import { useState, useEffect } from 'react'
import { fetchMarketNews } from '../services/marketDataProvider'
import { isStockApiConfigured } from '../services/stockApi'
import NewsArticleCard from './NewsArticleCard'

export default function MarketNews({ onAnalyze }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isStockApiConfigured()) {
      setLoading(false)
      setError(true)
      return undefined
    }

    let cancelled = false
    fetchMarketNews(8)
      .then((data) => {
        if (!cancelled) {
          setArticles(data)
          setError(data.length === 0)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="sw-card p-6 sm:p-8">
      <h2 className="sw-section-title">חדשות שוק מתעדכנות</h2>
      <p className="sw-section-subtitle text-xs">חדשות שוק אחרונות מ-Finnhub</p>

      {loading && (
        <div className="mt-6 flex items-center gap-3 text-sm sw-text-secondary">
          <div className="sw-spinner h-5 w-5" />
          טוען חדשות שוק…
        </div>
      )}

      {!loading && error && (
        <p className="mt-6 text-sm sw-text-secondary">אין מספיק נתונים עדכניים</p>
      )}

      {!loading && !error && articles.length > 0 && (
        <ul className="mt-6 space-y-3">
          {articles.map((article) => (
            <li key={article.id}>
              <NewsArticleCard article={article} onTickerClick={onAnalyze} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
