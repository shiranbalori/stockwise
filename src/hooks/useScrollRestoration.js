import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const SCROLL_KEY_PREFIX = 'stockwise_scroll:'

export function useScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const prevPathRef = useRef(`${location.pathname}${location.search}`)

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}`
    const scrollKey = SCROLL_KEY_PREFIX + currentPath

    if (navigationType === 'POP') {
      const saved = sessionStorage.getItem(scrollKey)
      if (saved != null) {
        requestAnimationFrame(() => {
          window.scrollTo(0, Number.parseInt(saved, 10))
        })
      }
    } else if (location.pathname.startsWith('/stock/')) {
      window.scrollTo(0, 0)
    } else if (navigationType === 'PUSH' || navigationType === 'REPLACE') {
      window.scrollTo(0, 0)
    }

    return () => {
      const prevKey = SCROLL_KEY_PREFIX + prevPathRef.current
      sessionStorage.setItem(prevKey, String(window.scrollY))
      prevPathRef.current = currentPath
    }
  }, [location.pathname, location.search, navigationType])
}
