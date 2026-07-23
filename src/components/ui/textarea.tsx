import { cn } from "@/lib/utils"

function Textarea({
  className,
  ref,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> }) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full bg-surface-container border border-outline px-4 py-3 font-sans text-xs placeholder:text-on-background/30 focus-visible:outline-none focus-visible:border-[#F27D26] disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-2xl",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Textarea }
