export default function AuthPlaceholder({ user, loading, error, signIn, signOut, isFirebaseConfigured }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        בודק התחברות…
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-semibold text-slate-200">התחברות</h3>
      <p className="mt-1 text-xs text-slate-400">
        התחברות אוטומטית לסנכרון מועדפים והיסטוריית חיפושים בין מכשירים.
      </p>

      {!isFirebaseConfigured && (
        <p className="mt-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
          {import.meta.env.DEV
            ? (
              <>
                Firebase לא מוגדר. העתיקו את <code className="text-indigo-400">.env.example</code> ל{' '}
                <code className="text-indigo-400">.env</code> והוסיפו את פרטי ההתחברות.
                עד אז הנתונים נשמרים מקומית.
              </>
            )
            : 'שירות הענן אינו זמין כרגע. הנתונים נשמרים מקומית במכשיר זה.'}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      <div className="mt-3 flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xs text-emerald-400">
              מחובר {user.isAnonymous ? '(אורח)' : ''}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
            >
              התנתק
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={signIn}
            disabled={!isFirebaseConfigured}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            התחבר כאורח
          </button>
        )}
      </div>
    </div>
  )
}
