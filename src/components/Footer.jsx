import { MESSAGES } from '../constants/messages'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[rgba(148,163,184,0.12)] pt-8 pb-8 text-center">
      <p className="text-sm font-medium sw-text-muted">StockWise</p>
      <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-[rgba(203,213,225,0.45)]">
        {MESSAGES.footerDisclaimer}
      </p>
    </footer>
  )
}
