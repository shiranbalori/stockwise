export default function FavoritesList({ favorites, onSelect, onRemove }) {
  if (favorites.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="text-sm font-semibold text-slate-200">מועדפים</h3>
        <p className="mt-2 text-sm text-slate-500">
          אין מניות שמורות עדיין. בצעו ניתוח למניה ולחצו על הלב כדי לשמור.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-semibold text-slate-200">מועדפים</h3>
      <ul className="mt-3 space-y-2">
        {favorites.map((fav) => (
          <li
            key={fav.symbol}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
          >
            <button
              type="button"
              onClick={() => onSelect(fav.symbol)}
              className="text-start transition hover:text-indigo-300"
            >
              <span className="text-sm font-semibold text-white" dir="ltr">{fav.symbol}</span>
              <span className="ms-2 text-xs text-slate-400">{fav.name}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(fav.symbol)}
              className="rounded p-1 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
              aria-label={`הסר ${fav.symbol} מהמועדפים`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
