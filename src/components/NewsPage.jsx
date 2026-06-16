import { useState, useEffect } from 'react'
import MarketNews from './MarketNews'
import NewsArticleCard from './NewsArticleCard'
import { NEWS_TOPICS, NEWS_DISCLAIMER } from '../data/newsTopics'
import { fetchTopicNewsById } from '../services/newsService'
import { getWeeklyTrendingStocks } from '../services/trendingService'
import { TRENDING_DISCLAIMER } from '../data/stockCategories'

export default function NewsPage({ onAnalyze }) {
  const [selectedTopic, setSelectedTopic] = useState(NEWS_TOPICS[0].id)
  const [topicNews, setTopicNews] = useState([])
  const [topicLoading, setTopicLoading] = useState(true)
  const [weeklyStocks, setWeeklyStocks] = useState([])
  const [weeklyLoading, setWeeklyLoading] = useState(true)
  const [weeklyInsufficient, setWeeklyInsufficient] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTopicLoading(true)
    fetchTopicNewsById(selectedTopic, NEWS_TOPICS).then((articles) => {
      if (!cancelled) {
        setTopicNews(articles)
        setTopicLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [selectedTopic])

  useEffect(() => {
    let cancelled = false
    setWeeklyLoading(true)
    getWeeklyTrendingStocks(10).then((result) => {
      if (!cancelled) {
        setWeeklyStocks(result.stocks)
        setWeeklyInsufficient(result.hasInsufficientData)
        setWeeklyLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-10">
      <div>
        <h2 className="sw-section-title text-2xl">חדשות</h2>
        <p className="sw-section-subtitle text-xs">{NEWS_DISCLAIMER}</p>
      </div>

      <MarketNews onAnalyze={onAnalyze} />

      <section className="sw-card p-6 sm:p-8">
        <h3 className="sw-section-title">חדשות לפי תחום</h3>
        <p className="sw-section-subtitle text-xs">חדשות חברות לפי תחומי שוק</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {NEWS_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedTopic(topic.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selectedTopic === topic.id
                  ? 'border-[#60A5FA] bg-[rgba(96,165,250,0.12)] text-[#60A5FA]'
                  : 'border-[rgba(148,163,184,0.2)] bg-[#243447] text-[#CBD5E1] hover:border-[rgba(96,165,250,0.35)]'
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>

        {topicLoading && (
          <div className="mt-6 flex items-center gap-3 text-sm sw-text-secondary">
            <div className="sw-spinner h-5 w-5" />
            טוען חדשות תחום…
          </div>
        )}

        {!topicLoading && topicNews.length === 0 && (
          <p className="mt-6 text-sm sw-text-secondary">אין מספיק נתונים עדכניים</p>
        )}

        {!topicLoading && topicNews.length > 0 && (
          <ul className="mt-6 space-y-3">
            {topicNews.map((article) => (
              <li key={article.id}>
                <NewsArticleCard article={article} onTickerClick={onAnalyze} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sw-card p-6 sm:p-8">
        <h3 className="sw-section-title">מניות הכי מדוברות השבוע</h3>
        <p className="sw-section-subtitle text-xs">{TRENDING_DISCLAIMER}</p>

        {weeklyLoading && (
          <div className="mt-6 flex items-center gap-3 text-sm sw-text-secondary">
            <div className="sw-spinner h-5 w-5" />
            מחשב מניות מדוברות…
          </div>
        )}

        {!weeklyLoading && weeklyInsufficient && (
          <p className="mt-6 text-sm sw-text-secondary">אין מספיק נתונים עדכניים</p>
        )}

        {!weeklyLoading && !weeklyInsufficient && (
          <ul className="mt-6 space-y-3">
            {weeklyStocks.map((stock, index) => {
              const isPositive = (stock.changePercent ?? 0) >= 0
              return (
                <li key={stock.symbol}>
                  <button
                    type="button"
                    onClick={() => onAnalyze(stock.symbol)}
                    className="sw-card-inner w-full p-4 text-start transition hover:border-[rgba(96,165,250,0.35)] hover:bg-[#2d3f54]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs sw-text-muted">#{index + 1}</span>
                          <span className="truncate text-sm font-semibold text-[#F8FAFC]">{stock.name}</span>
                          <span className="text-sm font-semibold text-[#60A5FA]" dir="ltr">{stock.symbol}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sw-text-secondary">
                          {stock.price != null && <span dir="ltr">${stock.price.toFixed(2)}</span>}
                          {stock.changePercent != null && (
                            <span className={isPositive ? 'text-[#22C55E]' : 'text-red-400'} dir="ltr">
                              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          )}
                          <span>{stock.newsCount} אזכורים</span>
                          <span>רגש: {stock.sentimentDetail ?? stock.sentimentLabel}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-center">
                        <div className="rounded-lg bg-[#243447] px-2.5 py-1 border border-[rgba(148,163,184,0.12)]">
                          <span className="text-lg font-semibold text-[#60A5FA]">{stock.interestScore}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] sw-text-muted">ציון עניין</p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
