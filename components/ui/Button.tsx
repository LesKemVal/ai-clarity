import * as React from "react";

export type GeorgeButtonVariant =
  | "primary"
  | "secondary"
  | "quiet"
  | "danger";

export type GeorgeButtonSize =
  | "sm"
  | "md"
  | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: GeorgeButtonVariant;
  size?: GeorgeButtonSize;
};

const baseClassName = [
  "inline-flex",
  "shrink-0",
  "items-center",
  "justify-center",
  "gap-2",
  "whitespace-nowrap",
  "font-semibold",
  "transition",
  "disabled:pointer-events-none",
  "disabled:cursor-default",
  "disabled:opacity-35",
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-[var(--george-focus-color)]",
  "focus-visible:ring-offset-2",
  "focus-visible:ring-offset-black",
].join(" ");

const variantClassNames: Record<GeorgeButtonVariant, string> = {
  primary: [
    "george-primary-action",
    "border",
    "text-white",
  ].join(" "),

  secondary: [
    "border",
    "border-white/[0.12]",
    "bg-transparent",
    "text-white/62",
    "hover:border-white/28",
    "hover:text-white",
  ].join(" "),

  quiet: [
    "border",
    "border-transparent",
    "bg-transparent",
    "text-white/46",
    "hover:text-white/76",
  ].join(" "),

  danger: [
    "border",
    "border-[var(--george-color-danger)]/30",
    "bg-transparent",
    "text-[var(--george-color-danger)]",
    "hover:border-[var(--george-color-danger)]/55",
  ].join(" "),
};

const sizeClassNames: Record<GeorgeButtonSize, string> = {
  sm: "min-h-8 rounded-[var(--george-radius-sm)] px-3 py-1.5 text-[10px]",
  md: "min-h-9 rounded-[var(--george-radius-md)] px-4 py-2 text-[11px]",
  lg: "min-h-10 rounded-[var(--george-radius-lg)] px-5 py-2.5 text-[12px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "secondary",
      size = "md",
      type = "button",
      className = "",
      ...props
    },
    ref,
  ) {
    const classes = [
      baseClassName,
      variantClassNames[variant],
      sizeClassNames[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        data-george-button=""
        data-variant={variant}
        data-size={size}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
