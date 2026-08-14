import * as React from "react";

export type GeorgeStatusMarkTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "live";

export type GeorgeStatusMarkSize =
  | "sm"
  | "md"
  | "lg";

export type StatusMarkProps =
  React.HTMLAttributes<HTMLSpanElement> & {
    tone?: GeorgeStatusMarkTone;
    size?: GeorgeStatusMarkSize;
    glow?: boolean;
  };

const baseClassName = [
  "inline-block",
  "shrink-0",
  "rounded-full",
].join(" ");

const toneClassNames: Record<GeorgeStatusMarkTone, string> = {
  neutral: "bg-[var(--george-color-text-muted)]",
  accent: "bg-[var(--george-color-accent)]",
  success: "bg-[var(--george-color-success)]",
  warning: "bg-[var(--george-color-warning)]",
  danger: "bg-[var(--george-color-danger)]",
  live: "bg-[var(--george-color-live)]",
};

const glowClassNames: Record<GeorgeStatusMarkTone, string> = {
  neutral: "shadow-[0_0_8px_var(--george-color-text-muted)]",
  accent: "shadow-[0_0_8px_var(--george-color-accent)]",
  success: "shadow-[0_0_8px_var(--george-color-success)]",
  warning: "shadow-[0_0_8px_var(--george-color-warning)]",
  danger: "shadow-[0_0_8px_var(--george-color-danger)]",
  live: "shadow-[0_0_8px_var(--george-color-live)]",
};

const sizeClassNames: Record<GeorgeStatusMarkSize, string> = {
  sm: "h-1 w-1",
  md: "h-1.5 w-1.5",
  lg: "h-2 w-2",
};

export const StatusMark = React.forwardRef<
  HTMLSpanElement,
  StatusMarkProps
>(function StatusMark(
  {
    tone = "neutral",
    size = "md",
    glow = false,
    className = "",
    ...props
  },
  ref,
) {
  const classes = [
    baseClassName,
    toneClassNames[tone],
    sizeClassNames[size],
    glow ? glowClassNames[tone] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={ref}
      className={classes}
      data-george-status-mark=""
      data-tone={tone}
      data-size={size}
      data-glow={glow ? "true" : "false"}
      aria-hidden="true"
      {...props}
    />
  );
});

StatusMark.displayName = "StatusMark";
