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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
      <h2 className="text-base font-semibold text-white">חיפוש מניה</h2>
      <p className="mt-1 text-sm text-slate-400">
        נסו AAPL, NVDA, MSFT או SOFI
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          dir="ltr"
          value={query}
          disabled={loading}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase())
            setError('')
          }}
          placeholder="הזן סימול מניה (לדוגמה AAPL)"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'טוען…' : 'ניתוח'}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-4">
        <p className="text-xs font-medium tracking-wider text-slate-500">
          סימולים נפוצים
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestedTickers.map((ticker) => (
            <button
              key={ticker}
              type="button"
              disabled={loading}
              onClick={() => handleChipClick(ticker)}
              className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-indigo-500 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
              dir="ltr"
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-wider text-slate-500">
            היסטוריית חיפושים
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentSearches.map((ticker) => (
              <button
                key={ticker}
                type="button"
                disabled={loading}
                onClick={() => handleChipClick(ticker)}
                className="rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
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
