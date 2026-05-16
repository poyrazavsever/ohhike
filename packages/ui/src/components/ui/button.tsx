import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90",
        info: "bg-info text-info-foreground hover:bg-info/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

type IconSlideButtonProps<T extends React.ElementType = "button"> = {
  as?: T;
  icon: React.ReactNode;
  text: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children">;

const iconSlideButtonVariants = cva(
  "group relative inline-flex h-14 w-54 shrink-0 items-center overflow-hidden rounded-full text-sm font-bold outline-none transition-all duration-300 [transition-timing-function:cubic-bezier(0.310,-0.105,0.430,1.400)] focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary",
        outline:
          "border border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function IconSlideButton<T extends React.ElementType = "button">({
  as,
  className,
  icon,
  text,
  variant,
  ...props
}: IconSlideButtonProps<T>) {
  const Comp = as ?? "button";

  return (
    <Comp
      data-slot="icon-slide-button"
      className={cn(iconSlideButtonVariants({ variant, className }))}
      {...props}
    >
      <span className="absolute left-0 top-0 flex h-full w-[72%] items-center justify-center px-6 transition-all duration-300 [transition-timing-function:cubic-bezier(0.310,-0.105,0.430,1.400)] after:absolute after:right-0 after:top-[18%] after:h-[64%] after:w-px after:bg-current/18 group-hover:-left-[72%] group-hover:opacity-0">
        {text}
      </span>
      <span className="absolute right-0 top-0 flex h-full w-[28%] items-center justify-center transition-all duration-300 [transition-timing-function:cubic-bezier(0.310,-0.105,0.430,1.400)] group-hover:w-full [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:transition-all [&_svg]:duration-300 [&_svg]:[transition-timing-function:cubic-bezier(0.310,-0.105,0.430,1.400)] group-hover:[&_svg]:size-7">
        {icon}
      </span>
    </Comp>
  );
}

export { Button, buttonVariants, IconSlideButton, iconSlideButtonVariants };
