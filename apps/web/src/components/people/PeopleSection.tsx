import type { ReactNode } from 'react'

/** One group on the People page, with a heading and how many people are in it. */
export default function PeopleSection({ id, title, count, description, children }: {
  id: string
  title: string
  count: number
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-outline-variant py-14 md:py-16">
      <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 className="font-sans text-2xl font-black tracking-tight text-on-background md:text-3xl">{title}</h2>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-on-background/50">
          {count} {count === 1 ? 'person' : 'people'}
        </span>
      </div>
      {description && <p className="-mt-4 mb-8 max-w-3xl text-base leading-relaxed text-on-background/70">{description}</p>}
      {children}
    </section>
  )
}
