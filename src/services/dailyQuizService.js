import { DAILY_QUIZ_QUESTIONS } from '../data/dailyQuizQuestions'

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function hashDateKey(dateKey) {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getDailyQuizQuestion(dateKey = getLocalDateKey()) {
  if (DAILY_QUIZ_QUESTIONS.length === 0) return null
  const index = hashDateKey(dateKey) % DAILY_QUIZ_QUESTIONS.length
  return DAILY_QUIZ_QUESTIONS[index]
}

export function isAnswerCorrect(question, selectedIndex) {
  return selectedIndex === question.correctIndex
}
