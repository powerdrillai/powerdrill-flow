import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 dark:bg-primary/80 dark:hover:bg-primary/70 dark:shadow-md",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 dark:bg-destructive/80 dark:hover:bg-destructive/70 dark:shadow-md",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-transparent dark:border-border/15 dark:hover:bg-accent/10 dark:hover:border-primary/20 dark:shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 dark:bg-secondary/60 dark:hover:bg-secondary/50 dark:shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/10 dark:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline dark:text-primary/80 dark:hover:text-primary",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
