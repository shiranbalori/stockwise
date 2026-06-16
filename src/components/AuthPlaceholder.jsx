export default function AuthPlaceholder({ user, loading, error, signIn, signOut, isFirebaseConfigured }) {
  if (loading) {
    return (
      <div className="sw-card p-5 text-sm sw-text-muted">
        בודק התחברות…
      </div>
    )
  }

  return (
    <div className="sw-card p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[#F8FAFC]">התחברות</h3>
      <p className="mt-2 text-sm sw-text-secondary">
        התחברות אוטומטית לסנכרון מועדפים והיסטוריית חיפושים בין מכשירים.
      </p>

      {!isFirebaseConfigured && (
        <p className="mt-4 rounded-xl bg-[#243447] px-3 py-2.5 text-xs sw-text-secondary">
          {import.meta.env.DEV
            ? (
              <>
                Firebase לא מוגדר. העתיקו את <code className="text-[#60A5FA]">.env.example</code> ל{' '}
                <code className="text-[#60A5FA]">.env</code> והוסיפו את פרטי ההתחברות.
                עד אז הנתונים נשמרים מקומית.
              </>
            )
            : 'שירות הענן אינו זמין כרגע. הנתונים נשמרים מקומית במכשיר זה.'}
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xs text-[#22C55E]">
              מחובר {user.isAnonymous ? '(אורח)' : ''}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="sw-btn-secondary"
            >
              התנתק
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={signIn}
            disabled={!isFirebaseConfigured}
            className="sw-btn-primary px-4 py-2 text-xs"
          >
            התחבר כאורח
          </button>
        )}
      </div>
    </div>
  )
}
