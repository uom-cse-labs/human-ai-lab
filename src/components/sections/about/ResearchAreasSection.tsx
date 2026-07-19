import { useState } from "react"
import SectionHeader from "@/components/sections/SectionHeader"

interface AccordionItem {
  title: string
  content: string
}

interface ResearchAreasSectionProps {
  items: AccordionItem[]
}

function AccordionItem({
  title,
  content,
  isOpen,
  onToggle,
}: {
  title: string
  content: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-divider-token last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-8 py-6 text-left transition-colors duration-200 hover:bg-bg-muted"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-neutral-900">{title}</span>
        <span
          className={`size-6 shrink-0 text-text-muted transition-transform duration-300 ease-in-out ${isOpen ? "rotate-45" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-8 pb-6 text-base leading-relaxed text-text-secondary">
            {content}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResearchAreasSection({
  items,
}: ResearchAreasSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <SectionHeader title="Research Areas" />
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-border-token bg-white">
          {items.map((item, i) => (
            <AccordionItem
              key={item.title}
              title={item.title}
              content={item.content}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
