export default function Header() {
  return (
    <header className="border-b border-[rgba(148,163,184,0.15)] bg-[#0F172A]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#243447] border border-[rgba(148,163,184,0.2)]">
          <svg
            className="h-5 w-5 text-[#60A5FA]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-[1.4rem] font-bold leading-tight tracking-tight text-[#F8FAFC] sm:text-[1.5625rem]">
            StockWise
          </h1>
          <p className="mt-0.5 text-sm text-[#CBD5E1]">
            גלו מגמות, חדשות ותובנות בשוק ההון
          </p>
        </div>
      </div>
    </header>
  )
}
