import * as React from "react";

export type GeorgeIconButtonVariant =
  | "quiet"
  | "secondary"
  | "danger";

export type GeorgeIconButtonSize =
  | "sm"
  | "md"
  | "lg";

export type IconButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: GeorgeIconButtonVariant;
    size?: GeorgeIconButtonSize;
  };

const baseClassName = [
  "inline-flex",
  "shrink-0",
  "items-center",
  "justify-center",
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

const variantClassNames: Record<GeorgeIconButtonVariant, string> = {
  quiet: [
    "border",
    "border-transparent",
    "bg-transparent",
    "text-white/46",
    "hover:bg-white/[0.035]",
    "hover:text-white/78",
  ].join(" "),

  secondary: [
    "border",
    "border-white/[0.08]",
    "bg-white/[0.025]",
    "text-white/56",
    "hover:border-white/[0.14]",
    "hover:bg-white/[0.05]",
    "hover:text-white",
  ].join(" "),

  danger: [
    "border",
    "border-transparent",
    "bg-transparent",
    "text-[var(--george-color-danger)]",
    "hover:bg-white/[0.035]",
  ].join(" "),
};

const sizeClassNames: Record<GeorgeIconButtonSize, string> = {
  sm: "h-7 w-7 rounded-[var(--george-radius-sm)]",
  md: "h-8 w-8 rounded-[var(--george-radius-md)]",
  lg: "h-9 w-9 rounded-[var(--george-radius-md)]",
};

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(function IconButton(
  {
    variant = "quiet",
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
      data-george-icon-button=""
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
});

IconButton.displayName = "IconButton";
