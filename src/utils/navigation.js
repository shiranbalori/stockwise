export function stockPath(symbol) {
  return `/stock/${symbol.trim().toUpperCase()}`
}

export function saveReturnPath(path) {
  sessionStorage.setItem('stockwise_from_path', path)
}

export function getReturnPath() {
  return sessionStorage.getItem('stockwise_from_path') || '/'
}

export function pathToTabId(pathname) {
  if (pathname.startsWith('/categories')) return 'categories'
  if (pathname.startsWith('/news')) return 'news'
  if (pathname.startsWith('/favorites')) return 'favorites'
  return 'search'
}
