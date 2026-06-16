export default function NewsSummary({ items, isLive }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">חדשות אחרונות</h3>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
          {isLive ? 'Finnhub' : 'דמו'}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2.5 text-sm text-slate-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
