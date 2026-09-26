import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  centered?: boolean
  description?: string
  className?: string
  as?: "h1" | "h2"
}

export default function SectionHeader({
  title,
  centered,
  description,
  className,
  as: Tag = "h2",
}: SectionHeaderProps) {
  return (
    <div className={className}>
      <div className={cn("mb-6 h-1 w-16 bg-primary", centered && "mx-auto")} />
      <Tag
        className={cn(
          "text-4xl font-semibold text-on-background lg:text-5xl",
          centered && "text-center",
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "mt-4 max-w-3xl text-lead leading-relaxed text-on-background/60",
            centered && "mx-auto text-center",
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
