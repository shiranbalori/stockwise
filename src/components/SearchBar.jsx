import { useState } from 'react'
import { MESSAGES } from '../constants/messages'

export default function SearchBar({ onSearch, suggestedTickers, recentSearches, loading = false }) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    const trimmed = query.trim()
    if (!trimmed) {
      setError(MESSAGES.emptyTicker)
      return
    }
    setError('')
    onSearch(trimmed)
  }

  function handleChipClick(ticker) {
    if (loading) return
    setQuery(ticker)
    setError('')
    onSearch(ticker)
  }

  return (
    <div className="sw-card-search p-6 sm:p-7">
      <h2 className="sw-section-title text-[1.35rem]">חיפוש מניה</h2>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          dir="ltr"
          value={query}
          disabled={loading}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase())
            setError('')
          }}
          className="sw-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="sw-btn-primary shrink-0"
        >
          {loading ? 'טוען…' : 'ניתוח'}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-6 border-t border-[rgba(148,163,184,0.12)] pt-5">
        <p className="text-xs font-medium sw-text-muted">
          סימולים נפוצים
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedTickers.map((ticker) => (
            <button
              key={ticker}
              type="button"
              disabled={loading}
              onClick={() => handleChipClick(ticker)}
              className="sw-btn-chip"
              dir="ltr"
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium sw-text-muted">
            היסטוריית חיפושים
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((ticker) => (
              <button
                key={ticker}
                type="button"
                disabled={loading}
                onClick={() => handleChipClick(ticker)}
                className="sw-btn-chip opacity-80"
                dir="ltr"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
