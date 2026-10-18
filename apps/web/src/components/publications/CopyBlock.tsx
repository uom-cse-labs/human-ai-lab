import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

/** Preformatted text (a citation, BibTeX) with a button that copies it. */
export default function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context): the text can still be selected by hand.
    }
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-on-background/60">{label}</h3>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant px-4 text-sm font-bold text-on-background transition-colors hover:border-on-background"
        >
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-outline-variant bg-surface p-5 font-mono text-sm leading-relaxed text-on-background/80">
        {text}
      </pre>
    </div>
  )
}
