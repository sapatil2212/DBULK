import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shimmer-button",
  {
    variants: {
      variant: {
        default: "bg-[#25D366] text-white hover:bg-[#1DA851] border border-[#25D366]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40 border border-red-500",
        outline:
          "border border-[var(--border)] bg-white hover:bg-gray-50 hover:text-gray-900 dark:bg-[var(--background-secondary)] dark:border-[var(--border)] dark:hover:bg-[var(--background-secondary)] dark:text-[var(--foreground)]",
        secondary:
          "bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-gray-200 dark:bg-[var(--background-secondary)] dark:text-[var(--foreground)] dark:hover:bg-[var(--highlight-background)] border border-[var(--border)]",
        ghost:
          "hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)] dark:hover:bg-[var(--background-secondary)] dark:hover:text-[var(--foreground)]",
        link: "text-[#25D366] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
