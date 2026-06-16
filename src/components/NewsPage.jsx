import { useState, useEffect } from 'react'
import MarketNews from './MarketNews'
import NewsArticleCard from './NewsArticleCard'
import { NEWS_TOPICS, NEWS_DISCLAIMER } from '../data/newsTopics'
import { fetchTopicNewsById } from '../services/newsService'

export default function NewsPage({ onAnalyze }) {
  const [selectedTopic, setSelectedTopic] = useState(NEWS_TOPICS[0].id)
  const [topicNews, setTopicNews] = useState([])
  const [topicLoading, setTopicLoading] = useState(true)

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
    </div>
  )
}
