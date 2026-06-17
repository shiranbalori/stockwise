import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'

const FAVORITES = 'favorites'
const SEARCH_HISTORY = 'searchHistory'
const QUIZ_ATTEMPTS = 'quizAttempts'

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
  const upper = symbol.toUpperCase()
  await setDoc(doc(db, 'users', userId, SEARCH_HISTORY, upper), {
    symbol: upper,
    searchedAt: serverTimestamp(),
  })
}

export async function getSearchHistory(userId, max = 5) {
  if (!isFirebaseConfigured || !db || !userId) return []
  const q = query(
    userCollection(userId, SEARCH_HISTORY),
    orderBy('searchedAt', 'desc'),
    limit(max),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getQuizAttempt(userId, dateKey) {
  if (!isFirebaseConfigured || !db || !userId || !dateKey) return null
  const snap = await getDoc(doc(db, 'users', userId, QUIZ_ATTEMPTS, dateKey))
  return snap.exists() ? snap.data() : null
}

export async function saveQuizAttempt(userId, attempt) {
  if (!isFirebaseConfigured || !db || !userId || !attempt?.dateKey) return
  await setDoc(doc(db, 'users', userId, QUIZ_ATTEMPTS, attempt.dateKey), {
    dateKey: attempt.dateKey,
    questionId: attempt.questionId,
    selectedIndex: attempt.selectedIndex,
    correct: attempt.correct,
    answeredAt: serverTimestamp(),
  })
}
