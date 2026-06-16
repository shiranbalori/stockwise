export function mapNewsArticle(item) {
  if (!item?.headline) return null
  return {
    id: item.id ?? `${item.datetime}-${item.headline}`,
    headline: item.headline,
    source: item.source || 'לא ידוע',
    summary: item.summary || '',
    url: item.url || null,
    datetime: item.datetime ?? null,
    related: item.related || null,
  }
}

export function formatNewsDate(timestamp) {
  if (!timestamp) return '—'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncateSummary(text, max = 140) {
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}
