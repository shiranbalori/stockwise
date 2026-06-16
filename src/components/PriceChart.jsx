export default function PriceChart({ points, isPositive, isLive }) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const width = 100
  const height = 48

  const pathData = points
    .map((point, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((point - min) / range) * (height - 8) - 4
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const strokeColor = isPositive ? '#34d399' : '#f87171'

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">גרף מחיר</h3>
        <span className="text-xs text-slate-500">
          {isLive ? 'נתונים חיים · 10 ימים' : 'נתוני גיבוי · 10 ימים'}
        </span>
      </div>
      <div className="relative h-32 w-full" dir="ltr">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
            fill="url(#chartGradient)"
          />
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}
