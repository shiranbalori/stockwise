import { useDailyQuiz } from '../hooks/useDailyQuiz'
import { useAuth } from '../hooks/useAuth'
import { QUIZ_DISCLAIMER } from '../data/dailyQuizQuestions'

export default function QuizPage() {
  const { user } = useAuth()
  const { question, attempt, loading, submitting, hasAnswered, submitAnswer } = useDailyQuiz(user?.uid)

  if (loading) {
    return (
      <div className="sw-card flex min-h-72 flex-col items-center justify-center p-10 text-center">
        <div className="sw-spinner h-10 w-10" />
        <p className="mt-5 text-sm font-medium sw-text-secondary">טוען חידון יומי…</p>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="sw-card p-10 text-center">
        <h2 className="sw-section-title text-2xl">חידון יומי</h2>
        <p className="mt-4 text-sm sw-text-secondary">אין שאלה זמינה כרגע.</p>
      </div>
    )
  }

  const selectedIndex = attempt?.selectedIndex
  const isCorrect = attempt?.correct

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="sw-section-title text-2xl">חידון יומי</h2>
        <p className="sw-section-subtitle text-xs">{QUIZ_DISCLAIMER}</p>
      </div>

      <section className="sw-card p-6 sm:p-8">
        <p className="text-xs font-medium sw-text-muted">שאלה להיום</p>
        <h3 className="mt-3 text-lg font-semibold text-[#F8FAFC]">{question.question}</h3>

        {!hasAnswered && (
          <ul className="mt-6 space-y-3">
            {question.options.map((option, index) => (
              <li key={index}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitAnswer(index)}
                  className="sw-card-inner w-full px-4 py-3 text-start text-sm text-[#F8FAFC] transition hover:border-[rgba(96,165,250,0.35)] hover:bg-[#2d3f54] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasAnswered && (
          <div className="mt-6 space-y-5">
            <div
              className={`rounded-xl border p-4 ${
                isCorrect
                  ? 'border-[#22C55E]/30 bg-[#22C55E]/10'
                  : 'border-red-400/30 bg-red-400/10'
              }`}
            >
              <p className={`text-base font-semibold ${isCorrect ? 'text-[#22C55E]' : 'text-red-300'}`}>
                {isCorrect ? 'תשובה נכונה!' : 'תשובה שגויה'}
              </p>
              <p className="mt-2 text-sm sw-text-secondary">
                {isCorrect
                  ? 'כל הכבוד — בחרתם בתשובה הנכונה.'
                  : `התשובה הנכונה: ${question.options[question.correctIndex]}`}
              </p>
            </div>

            <div className="sw-card-inner p-4">
              <p className="text-xs font-medium sw-text-muted">הסבר</p>
              <p className="mt-2 text-sm sw-text-secondary">{question.explanation}</p>
            </div>

            {selectedIndex != null && selectedIndex !== question.correctIndex && (
              <p className="text-sm sw-text-secondary">
                הבחירה שלכם: {question.options[selectedIndex]}
              </p>
            )}

            <p className="text-sm font-medium text-[#60A5FA]">אפשר לנסות שוב מחר</p>
          </div>
        )}
      </section>
    </div>
  )
}
