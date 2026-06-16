import {
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './config'

export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export async function signInAsGuest() {
  if (!isFirebaseConfigured || !auth) {
    const error = new Error('Firebase not configured')
    error.code = 'auth/internal-error'
    throw error
  }
  return signInAnonymously(auth)
}

export async function signOutUser() {
  if (!isFirebaseConfigured || !auth) return
  return signOut(auth)
}
