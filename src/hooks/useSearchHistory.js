import { useState, useEffect, useCallback } from 'react'
import { addSearchHistory, getSearchHistory } from '../firebase/firestore'
import { isFirebaseConfigured } from '../firebase/config'
import { logError } from '../constants/messages'

const LOCAL_KEY = 'stockInsight_searchHistory'

function loadLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalHistory(history) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(history.slice(0, 5)))
}

function normalizeHistory(symbols) {
  const seen = new Set()
  const unique = []
  for (const symbol of symbols) {
    const upper = symbol.toUpperCase()
    if (!seen.has(upper)) {
      seen.add(upper)
      unique.push(upper)
    }
  }
  return unique.slice(0, 5)
}

function moveToTop(symbols, symbol) {
  const upper = symbol.toUpperCase()
  return normalizeHistory([upper, ...symbols.filter((s) => s.toUpperCase() !== upper)])
}

function canUseFirestore(userId) {
  return isFirebaseConfigured && Boolean(userId)
}

export function useSearchHistory(userId) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (canUseFirestore(userId)) {
      try {
        const data = await getSearchHistory(userId)
        setHistory(normalizeHistory(data.map((h) => h.symbol)))
        setLoading(false)
        return
      } catch (error) {
        logError('useSearchHistory', error)
      }
    }

    setHistory(normalizeHistory(loadLocalHistory()))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const recordSearch = async (symbol) => {
    const upper = symbol.toUpperCase()

    if (canUseFirestore(userId)) {
      try {
        await addSearchHistory(userId, upper)
        await refresh()
        return
      } catch (error) {
        logError('useSearchHistory', error)
      }
    }

    const updated = moveToTop(loadLocalHistory(), upper)
    saveLocalHistory(updated)
    setHistory(updated)
  }

  return { history, loading, recordSearch }
}
