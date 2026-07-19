import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-base font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:bg-brand-hover active:bg-brand-pressed",
        outline:
          "border-divider-token bg-white text-text-secondary hover:bg-bg-muted hover:text-neutral-900",
        secondary:
          "bg-bg-secondary text-text-secondary hover:bg-bg-muted",
        light:
          "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
      },
      size: {
        default: "h-12 gap-2 px-8",
        sm: "h-10 gap-1.5 px-5 text-sm",
        lg: "h-14 gap-2.5 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      <svg
        className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3l5 5-5 5" />
      </svg>
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
