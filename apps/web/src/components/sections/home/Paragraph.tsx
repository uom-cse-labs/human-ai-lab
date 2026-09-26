interface ParagraphProps {
  text: string
  isFirst: boolean
}

export default function Paragraph({ text, isFirst }: ParagraphProps) {
  return (
    <p
      className={
        isFirst
          ? "text-lead leading-relaxed text-on-background/60"
          : "mt-6 text-base leading-relaxed text-on-background/60"
      }
    >
      {text}
    </p>
  )
}
