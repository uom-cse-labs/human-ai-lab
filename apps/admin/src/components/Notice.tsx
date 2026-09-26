import type { ReactNode } from 'react'

type Tone = 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<Tone, string> = {
  success: 'border-success/30 bg-success-light text-success',
  warning: 'border-warning/30 bg-warning-light text-warning',
  danger: 'border-danger/30 bg-danger-light text-danger',
  info: 'border-outline bg-primary-light text-primary',
}

export default function Notice({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <div role={tone === 'danger' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${TONES[tone]}`}>{children}</div>
}
