import { fetchCompanyNewsRaw } from './marketDataProvider'
import { mapNewsArticle } from '../utils/news'
import { logError } from '../constants/messages'

export async function fetchTopicNews(tickers, limit = 6) {
  const results = await Promise.all(
    tickers.map((symbol) =>
      fetchCompanyNewsRaw(symbol, 14).catch(() => []),
    ),
  )

  const seen = new Set()
  const merged = []

  for (const items of results) {
    for (const item of items) {
      const article = mapNewsArticle(item)
      if (!article || seen.has(article.id)) continue
      seen.add(article.id)
      merged.push(article)
    }
  }

  merged.sort((a, b) => (b.datetime ?? 0) - (a.datetime ?? 0))
  return merged.slice(0, limit)
}

export async function fetchTopicNewsById(topicId, topics) {
  const topic = topics.find((t) => t.id === topicId)
  if (!topic) return []
  try {
    return await fetchTopicNews(topic.tickers, 6)
  } catch (error) {
    logError('newsService', error)
    return []
  }
}
