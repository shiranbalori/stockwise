const TABS = [
  { id: 'search', label: 'חיפוש מניה' },
  { id: 'categories', label: 'קטגוריות' },
  { id: 'news', label: 'חדשות' },
  { id: 'favorites', label: 'מועדפים' },
]

export default function TopNav({ activeView, onChange }) {
  return (
    <nav className="border-b border-[rgba(148,163,184,0.15)] bg-[#0F172A]/80">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`shrink-0 border-b-2 px-5 py-4 text-sm font-medium transition ${
              activeView === tab.id
                ? 'border-[#60A5FA] text-[#F8FAFC]'
                : 'border-transparent text-[#CBD5E1] hover:border-[rgba(148,163,184,0.3)] hover:text-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
