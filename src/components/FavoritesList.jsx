export default function FavoritesList({ favorites, onSelect, onRemove }) {
  if (favorites.length === 0) {
    return (
      <p className="text-sm sw-text-secondary">
        אין מניות שמורות עדיין. בצעו ניתוח למניה ולחצו על הלב כדי לשמור.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {favorites.map((fav) => (
        <li
          key={fav.symbol}
          className="sw-card-inner flex items-center justify-between px-4 py-3"
        >
          <button
            type="button"
            onClick={() => onSelect(fav.symbol)}
            className="text-start transition hover:text-[#60A5FA]"
          >
            <span className="text-sm font-semibold text-[#F8FAFC]" dir="ltr">{fav.symbol}</span>
            <span className="ms-2 text-xs sw-text-secondary">{fav.name}</span>
          </button>
          <button
            type="button"
            onClick={() => onRemove(fav.symbol)}
            className="rounded p-1 sw-text-muted transition hover:bg-[#2d3f54] hover:text-red-400"
            aria-label={`הסר ${fav.symbol} מהמועדפים`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
