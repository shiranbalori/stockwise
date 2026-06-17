import { NavLink, useLocation } from 'react-router-dom'
import { getReturnPath, pathToTabId } from '../utils/navigation'

const TABS = [
  { id: 'search', label: 'חיפוש מניה', to: '/' },
  { id: 'categories', label: 'קטגוריות', to: '/categories' },
  { id: 'news', label: 'חדשות', to: '/news' },
  { id: 'favorites', label: 'מועדפים', to: '/favorites' },
  { id: 'quiz', label: 'חידון יומי', to: '/quiz' },
]

function resolveActiveTab(pathname, locationState) {
  if (pathname.startsWith('/stock/')) {
    const fromPath = locationState?.from || getReturnPath()
    return pathToTabId(fromPath.split('?')[0])
  }
  return pathToTabId(pathname)
}

export default function TopNav() {
  const location = useLocation()
  const activeTab = resolveActiveTab(location.pathname, location.state)

  return (
    <nav className="border-b border-[rgba(148,163,184,0.15)] bg-[#0F172A]/80">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.to === '/'}
            className={() =>
              `shrink-0 border-b-2 px-5 py-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-[#60A5FA] text-[#F8FAFC]'
                  : 'border-transparent text-[#CBD5E1] hover:border-[rgba(148,163,184,0.3)] hover:text-[#F8FAFC]'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
