const RISK_STYLES = {
  Low: 'bg-[rgba(34,197,94,0.12)] text-[#22C55E] border-[rgba(34,197,94,0.25)]',
  Medium: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[rgba(245,158,11,0.25)]',
  High: 'bg-[rgba(248,113,113,0.12)] text-red-400 border-[rgba(248,113,113,0.25)]',
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
