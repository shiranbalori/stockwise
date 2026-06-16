export default function AIAnalysis({ text }) {
  return (
    <div className="sw-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#243447] border border-[rgba(148,163,184,0.12)]">
          <svg
            className="h-4 w-4 text-[#60A5FA]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#F8FAFC]">ניתוח AI</h3>
        <span className="rounded-full bg-[#243447] px-2 py-0.5 text-xs sw-text-secondary border border-[rgba(148,163,184,0.12)]">
          לימודי
        </span>
      </div>
      <p className="text-sm leading-relaxed sw-text-secondary">{text}</p>
    </div>
  )
}
