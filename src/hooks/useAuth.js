import { useState, useEffect } from 'react'
import { subscribeToAuth, signInAsGuest, signOutUser } from '../firebase/auth'
import { isFirebaseConfigured } from '../firebase/config'
import { toAuthErrorMessage, MESSAGES } from '../constants/messages'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return undefined
    }

    let cancelled = false

    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (cancelled) return

      if (firebaseUser) {
        setUser(firebaseUser)
        setLoading(false)
        return
      }

      try {
        await signInAsGuest()
      } catch (err) {
        if (!cancelled) {
          setError(toAuthErrorMessage(err))
          setLoading(false)
        }
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const signIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInAsGuest()
    } catch (err) {
      setError(toAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await signOutUser()
      setUser(null)
    } catch (err) {
      setError(MESSAGES.authSignOutFailed)
    }
  }

  return { user, loading, error, signIn, signOut, isFirebaseConfigured }
}
