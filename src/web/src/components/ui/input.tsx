import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { variantSize?: 'sm' | 'md' | 'lg' }>(
  ({ className, type, variantSize = 'md', ...props }, ref) => {
    const getSizeClass = (size: string) => {
      switch (size) {
        case 'sm':
          return 'h-8'
        case 'lg':
          return 'h-10'
        default:
          return 'h-9'
      }
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
          getSizeClass(variantSize)
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
