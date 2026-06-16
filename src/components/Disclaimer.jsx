import { MESSAGES } from '../constants/messages'

export default function Disclaimer() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <p className="font-medium">{MESSAGES.disclaimerTitle}</p>
      <p className="mt-1 text-amber-200/80">{MESSAGES.disclaimerBody}</p>
    </div>
  )
}
