import * as React from "react";

export type GeorgeSurfaceVariant =
  | "base"
  | "raised"
  | "overlay";

export type GeorgeSurfaceRadius =
  | "sm"
  | "md"
  | "lg"
  | "xl";

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: GeorgeSurfaceVariant;
  radius?: GeorgeSurfaceRadius;
};

const baseClassName = [
  "border",
  "border-[var(--george-border-subtle)]",
].join(" ");

const variantClassNames: Record<GeorgeSurfaceVariant, string> = {
  base: [
    "bg-[var(--george-color-surface)]",
    "shadow-none",
  ].join(" "),

  raised: [
    "bg-[var(--george-color-surface-raised)]",
    "shadow-[var(--george-shadow-raised)]",
  ].join(" "),

  overlay: [
    "bg-[var(--george-color-surface-raised)]",
    "shadow-[var(--george-shadow-overlay)]",
  ].join(" "),
};

const radiusClassNames: Record<GeorgeSurfaceRadius, string> = {
  sm: "rounded-[var(--george-radius-sm)]",
  md: "rounded-[var(--george-radius-md)]",
  lg: "rounded-[var(--george-radius-lg)]",
  xl: "rounded-[var(--george-radius-xl)]",
};

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  function Surface(
    {
      variant = "base",
      radius = "lg",
      className = "",
      ...props
    },
    ref,
  ) {
    const classes = [
      baseClassName,
      variantClassNames[variant],
      radiusClassNames[radius],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={classes}
        data-george-surface=""
        data-variant={variant}
        data-radius={radius}
        {...props}
      />
    );
  },
);

Surface.displayName = "Surface";
