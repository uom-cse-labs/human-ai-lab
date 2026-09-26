import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans font-black tracking-[0.2em] uppercase rounded-full transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        outline: "bg-transparent text-on-background border border-outline hover:bg-on-background hover:text-background hover:border-on-background",
        secondary: "bg-on-background text-background hover:bg-primary hover:text-white",
        ghost: "bg-transparent text-on-background/50 hover:text-primary",
      },
      size: {
        xl: "h-20 px-10 text-xs",
        lg: "h-14 px-8 text-[10px]",
        default: "h-12 px-6 text-xs",
        sm: "h-10 px-5 text-[10px]",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
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
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
