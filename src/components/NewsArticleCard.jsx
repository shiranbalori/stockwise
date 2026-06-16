import { formatNewsDate, truncateSummary } from '../utils/news'

export default function NewsArticleCard({ article, onTickerClick }) {
  return (
    <article className="sw-card-inner px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2 text-xs sw-text-muted">
        {article.related && (
          onTickerClick ? (
            <button
              type="button"
              onClick={() => onTickerClick(article.related.split(',')[0].trim())}
              className="rounded bg-[rgba(96,165,250,0.12)] px-1.5 py-0.5 font-medium text-[#60A5FA] transition hover:bg-[rgba(96,165,250,0.2)]"
              dir="ltr"
            >
              {article.related.split(',')[0].trim()}
            </button>
          ) : (
            <span
              className="rounded bg-[rgba(96,165,250,0.12)] px-1.5 py-0.5 font-medium text-[#60A5FA]"
              dir="ltr"
            >
              {article.related.split(',')[0].trim()}
            </span>
          )
        )}
        <span>{article.source}</span>
        <span>·</span>
        <time dateTime={article.datetime ? String(article.datetime) : undefined}>
          {formatNewsDate(article.datetime)}
        </time>
      </div>
      <h4 className="mt-2 text-sm font-semibold text-[#F8FAFC] sm:text-base">
        {article.headline}
      </h4>
      {article.summary && (
        <p className="mt-2 text-xs leading-relaxed sw-text-secondary">
          {truncateSummary(article.summary)}
        </p>
      )}
      {article.url && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sw-link mt-2 inline-block text-xs"
        >
          קראו את המאמר המלא ←
        </a>
      )}
    </article>
  )
}
