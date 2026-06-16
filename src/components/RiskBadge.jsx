const RISK_STYLES = {
  Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  High: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const RISK_LABELS = {
  Low: 'נמוכה',
  Medium: 'בינונית',
  High: 'גבוהה',
}

export default function RiskBadge({ level }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${RISK_STYLES[level] ?? RISK_STYLES.Medium}`}
    >
      רמת סיכון: {RISK_LABELS[level] ?? level}
    </span>
  )
}
