import * as React from "react";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseClassName = [
  "w-full",
  "rounded-[var(--george-radius-md)]",
  "border",
  "border-[var(--george-border-subtle)]",
  "bg-[var(--george-color-surface)]",
  "px-3",
  "py-2.5",
  "text-sm",
  "leading-6",
  "text-[var(--george-color-text-primary)]",
  "outline-none",
  "transition-[border-color,background-color,box-shadow]",
  "placeholder:text-[var(--george-color-text-muted)]",
  "focus:border-[var(--george-border-strong)]",
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
].join(" ");

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function Textarea(
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
    <textarea
      ref={ref}
      className={classes}
      data-george-textarea=""
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
