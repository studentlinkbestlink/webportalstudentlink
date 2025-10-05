import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#1E2A78] text-white shadow-sm hover:bg-[#1A2568] hover:shadow-md focus-visible:ring-[#1E2A78]/30",
        destructive:
          "bg-[#E22824] text-white shadow-sm hover:bg-[#DC2626] hover:shadow-md focus-visible:ring-[#E22824]/30",
        outline:
          "border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-gray-300/30",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 hover:shadow-md focus-visible:ring-gray-300/30",
        ghost:
          "hover:bg-gray-100/80 hover:text-gray-900 focus-visible:ring-gray-300/30",
        link: "text-[#1E2A78] underline-offset-4 hover:underline hover:text-[#2480EA] focus-visible:ring-[#1E2A78]/30",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2 text-xs",
        lg: "h-12 rounded-xl px-6 has-[>svg]:px-4 text-base",
        icon: "size-10 rounded-lg",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
