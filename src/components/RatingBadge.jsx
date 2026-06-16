const RATING_STYLES = {
  Interesting: 'bg-[rgba(96,165,250,0.12)] text-[#60A5FA] border-[rgba(96,165,250,0.25)]',
  Neutral: 'bg-[rgba(148,163,184,0.1)] text-[#CBD5E1] border-[rgba(148,163,184,0.2)]',
  Risky: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[rgba(245,158,11,0.25)]',
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
