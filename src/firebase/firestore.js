import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'

const FAVORITES = 'favorites'
const SEARCH_HISTORY = 'searchHistory'

function userCollection(userId, name) {
  return collection(db, 'users', userId, name)
}

export async function getFavorites(userId) {
  if (!isFirebaseConfigured || !db || !userId) return []
  const snap = await getDocs(userCollection(userId, FAVORITES))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveFavorite(userId, stock) {
  if (!isFirebaseConfigured || !db || !userId) return
  await setDoc(doc(db, 'users', userId, FAVORITES, stock.symbol), {
    symbol: stock.symbol,
    name: stock.name,
    savedAt: serverTimestamp(),
  })
}

export async function removeFavorite(userId, symbol) {
  if (!isFirebaseConfigured || !db || !userId) return
  await deleteDoc(doc(db, 'users', userId, FAVORITES, symbol))
}

export async function addSearchHistory(userId, symbol) {
  if (!isFirebaseConfigured || !db || !userId) return
  const id = `${symbol}_${Date.now()}`
  await setDoc(doc(db, 'users', userId, SEARCH_HISTORY, id), {
    symbol,
    searchedAt: serverTimestamp(),
  })
}

export async function getSearchHistory(userId, max = 10) {
  if (!isFirebaseConfigured || !db || !userId) return []
  const q = query(
    userCollection(userId, SEARCH_HISTORY),
    orderBy('searchedAt', 'desc'),
    limit(max),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
