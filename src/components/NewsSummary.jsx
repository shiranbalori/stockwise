import NewsArticleCard from './NewsArticleCard'

export default function NewsSummary({ articles, isLive }) {
  const hasArticles = Array.isArray(articles) && articles.length > 0

  return (
    <div className="sw-card p-5 sm:p-6 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#F8FAFC]">חדשות אחרונות על המניה</h3>
        <span className="rounded-full bg-[#243447] px-2 py-0.5 text-xs sw-text-muted border border-[rgba(148,163,184,0.12)]">
          {isLive ? 'Finnhub' : 'גיבוי'}
        </span>
      </div>

      {!hasArticles && (
        <p className="text-sm sw-text-secondary">אין מספיק נתונים עדכניים</p>
      )}

      {hasArticles && (
        <ul className="space-y-3">
          {articles.map((article) => (
            <li key={article.id}>
              <NewsArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
