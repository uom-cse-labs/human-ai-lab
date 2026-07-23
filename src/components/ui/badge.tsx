import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "font-mono text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center rounded-full px-3 py-1.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        outline: "bg-surface-container text-on-background border border-outline",
        ghost: "bg-transparent text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
