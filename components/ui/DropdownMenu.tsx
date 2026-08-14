"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent(
  {
    className = "",
    sideOffset = 8,
    ...props
  },
  ref,
) {
  const classes = [
    "z-[var(--george-z-overlay)]",
    "min-w-[10rem]",
    "overflow-hidden",
    "rounded-[var(--george-radius-md)]",
    "border",
    "border-[var(--george-border-subtle)]",
    "bg-[var(--george-color-surface-raised)]",
    "p-1",
    "text-[var(--george-color-text-primary)]",
    "shadow-[var(--george-shadow-overlay)]",
    "outline-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={classes}
        data-george-dropdown-menu-content=""
        {...props}
      />
    </DropdownMenuPortal>
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(function DropdownMenuItem(
  {
    className = "",
    ...props
  },
  ref,
) {
  const classes = [
    "relative",
    "flex",
    "cursor-default",
    "select-none",
    "items-center",
    "rounded-[var(--george-radius-sm)]",
    "px-3",
    "py-2",
    "text-sm",
    "text-[var(--george-color-text-secondary)]",
    "outline-none",
    "transition-colors",
    "focus:bg-white/[0.05]",
    "focus:text-[var(--george-color-text-primary)]",
    "data-[disabled]:pointer-events-none",
    "data-[disabled]:opacity-35",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={classes}
      data-george-dropdown-menu-item=""
      {...props}
    />
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator(
  {
    className = "",
    ...props
  },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={[
        "my-1",
        "h-px",
        "bg-[var(--george-border-subtle)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-george-dropdown-menu-separator=""
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(function DropdownMenuLabel(
  {
    className = "",
    ...props
  },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={[
        "px-3",
        "py-2",
        "text-[10px]",
        "font-semibold",
        "uppercase",
        "tracking-[0.16em]",
        "text-[var(--george-color-text-muted)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-george-dropdown-menu-label=""
      {...props}
    />
  );
});

DropdownMenuLabel.displayName = "DropdownMenuLabel";
