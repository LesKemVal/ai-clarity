import * as React from "react";

export type InputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

const baseClassName = [
  "w-full",
  "rounded-[var(--george-radius-md)]",
  "border",
  "border-[var(--george-border-subtle)]",
  "bg-[var(--george-color-surface)]",
  "px-3",
  "py-2.5",
  "text-sm",
  "text-[var(--george-color-text-primary)]",
  "outline-none",
  "transition-[border-color,background-color,box-shadow]",
  "placeholder:text-[var(--george-color-text-muted)]",
  "focus:border-[var(--george-border-strong)]",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
].join(" ");

export const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(function Input(
  {
    className = "",
    ...props
  },
  ref,
) {
  const classes = [
    baseClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      ref={ref}
      className={classes}
      data-george-input=""
      {...props}
    />
  );
});

Input.displayName = "Input";
