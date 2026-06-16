/**
 * Production-safe user-facing messages in Hebrew.
 * Never expose API keys, stack traces, or internal error codes to users.
 */

export const MESSAGES = {
  disclaimerTitle: 'לשימוש לימודי בלבד',
  disclaimerBody:
    'אפליקציה זו מיועדת למטרות לימוד ומידע בלבד ואינה מהווה ייעוץ השקעות. המידע אינו המלצה לקנייה, מכירה או החזקה של ניירות ערך.',

  emptyTicker: 'נא להזין סימול מניה.',
  stockLoadFailed: 'לא ניתן לטעון נתוני מניה כרגע. נסו שוב מאוחר יותר.',
  tickerNotFound: 'הסימול לא נמצא. בדקו שהסימול תקין ונסו שוב.',
  networkError: 'בעיית חיבור לרשת. בדקו את החיבור ונסו שוב.',

  authFailed: 'לא ניתן להתחבר כרגע. הנתונים נשמרים מקומית במכשיר זה.',
  authSignOutFailed: 'לא ניתן להתנתק כרגע. נסו שוב מאוחר יותר.',
  authAnonymousDisabled:
    'התחברות אורח אינה זמינה כרגע. הנתונים נשמרים מקומית במכשיר זה.',

  favoritesSaveFailed: 'לא ניתן לשמור למועדפים כרגע.',
  favoritesRemoveFailed: 'לא ניתן להסיר מהמועדפים כרגע.',
}

const FIREBASE_AUTH_MESSAGES = {
  'auth/operation-not-allowed': MESSAGES.authAnonymousDisabled,
  'auth/network-request-failed': MESSAGES.networkError,
  'auth/too-many-requests': 'יותר מדי ניסיונות התחברות. נסו שוב מאוחר יותר.',
  'auth/internal-error': MESSAGES.authFailed,
}

export function toAuthErrorMessage(error) {
  const code = error?.code
  if (code && FIREBASE_AUTH_MESSAGES[code]) {
    return FIREBASE_AUTH_MESSAGES[code]
  }
  return MESSAGES.authFailed
}

export function logError(context, error) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error)
  }
}
