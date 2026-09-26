import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full bg-surface-container border border-outline px-4 py-3 font-sans text-xs file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-background/30 focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 rounded-full",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}

export { Input }
