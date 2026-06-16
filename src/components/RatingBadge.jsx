const RATING_STYLES = {
  Interesting: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Neutral: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  Risky: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
}

const RATING_LABELS = {
  Interesting: 'מעניין',
  Neutral: 'ניטרלי',
  Risky: 'מסוכן',
}

export default function RatingBadge({ rating }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${RATING_STYLES[rating] ?? RATING_STYLES.Neutral}`}
    >
      דירוג לימודי: {RATING_LABELS[rating] ?? rating}
    </span>
  )
}
