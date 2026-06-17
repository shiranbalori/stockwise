import { useState, useEffect, useCallback } from 'react'
import { getQuizAttempt, saveQuizAttempt } from '../firebase/firestore'
import { isFirebaseConfigured } from '../firebase/config'
import {
  getDailyQuizQuestion,
  getLocalDateKey,
  isAnswerCorrect,
} from '../services/dailyQuizService'
import { logError } from '../constants/messages'

const LOCAL_QUIZ_KEY = 'stockwise_daily_quiz'

function canUseFirestore(userId) {
  return isFirebaseConfigured && Boolean(userId)
}

function loadLocalAttempt(dateKey) {
  try {
    const raw = localStorage.getItem(LOCAL_QUIZ_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.dateKey === dateKey ? parsed : null
  } catch {
    return null
  }
}

function saveLocalAttempt(attempt) {
  localStorage.setItem(LOCAL_QUIZ_KEY, JSON.stringify(attempt))
}

export function useDailyQuiz(userId) {
  const dateKey = getLocalDateKey()
  const question = getDailyQuizQuestion(dateKey)

  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)

    if (canUseFirestore(userId)) {
      try {
        const data = await getQuizAttempt(userId, dateKey)
        if (data) {
          setAttempt({
            dateKey: data.dateKey,
            questionId: data.questionId,
            selectedIndex: data.selectedIndex,
            correct: data.correct,
          })
          setLoading(false)
          return
        }
      } catch (error) {
        logError('useDailyQuiz', error)
      }
    }

    setAttempt(loadLocalAttempt(dateKey))
    setLoading(false)
  }, [userId, dateKey])

  useEffect(() => {
    refresh()
  }, [refresh])

  const submitAnswer = async (selectedIndex) => {
    if (!question || attempt || submitting) return null

    setSubmitting(true)
    const correct = isAnswerCorrect(question, selectedIndex)
    const nextAttempt = {
      dateKey,
      questionId: question.id,
      selectedIndex,
      correct,
    }

    try {
      if (canUseFirestore(userId)) {
        try {
          await saveQuizAttempt(userId, nextAttempt)
        } catch (error) {
          logError('useDailyQuiz', error)
          saveLocalAttempt(nextAttempt)
        }
      } else {
        saveLocalAttempt(nextAttempt)
      }

      setAttempt(nextAttempt)
      return nextAttempt
    } finally {
      setSubmitting(false)
    }
  }

  const hasAnswered = Boolean(attempt)

  return {
    question,
    attempt,
    loading,
    submitting,
    hasAnswered,
    submitAnswer,
    dateKey,
  }
}
