import { useState, useEffect, useCallback } from 'react'
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
} from '../firebase/firestore'
import { isFirebaseConfigured } from '../firebase/config'
import { logError } from '../constants/messages'

const LOCAL_KEY = 'stockInsight_favorites'

function loadLocalFavorites() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalFavorites(favorites) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(favorites))
}

function canUseFirestore(userId) {
  return isFirebaseConfigured && Boolean(userId)
}

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (canUseFirestore(userId)) {
      try {
        const data = await getFavorites(userId)
        setFavorites(data)
        setLoading(false)
        return
      } catch (error) {
        logError('useFavorites', error)
      }
    }

    setFavorites(loadLocalFavorites())
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addFavorite = async (stock) => {
    if (canUseFirestore(userId)) {
      try {
        await saveFavorite(userId, stock)
        await refresh()
        return
      } catch (error) {
        logError('useFavorites', error)
      }
    }

    const current = loadLocalFavorites()
    if (!current.some((f) => f.symbol === stock.symbol)) {
      const updated = [...current, { symbol: stock.symbol, name: stock.name }]
      saveLocalFavorites(updated)
      setFavorites(updated)
    }
  }

  const removeFavoriteBySymbol = async (symbol) => {
    if (canUseFirestore(userId)) {
      try {
        await removeFavorite(userId, symbol)
        await refresh()
        return
      } catch (error) {
        logError('useFavorites', error)
      }
    }

    const updated = loadLocalFavorites().filter((f) => f.symbol !== symbol)
    saveLocalFavorites(updated)
    setFavorites(updated)
  }

  const isFavorite = (symbol) =>
    favorites.some((f) => f.symbol === symbol.toUpperCase())

  return { favorites, loading, addFavorite, removeFavoriteBySymbol, isFavorite }
}
