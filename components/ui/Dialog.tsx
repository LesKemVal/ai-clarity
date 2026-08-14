"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay(
  {
    className = "",
    ...props
  },
  ref,
) {
  const classes = [
    "fixed",
    "inset-0",
    "z-[var(--george-z-overlay)]",
    "bg-black/72",
    "backdrop-blur-[2px]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={classes}
      data-george-dialog-overlay=""
      {...props}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function DialogContent(
  {
    className = "",
    children,
    ...props
  },
  ref,
) {
  const classes = [
    "fixed",
    "left-1/2",
    "top-1/2",
    "z-[var(--george-z-dialog)]",
    "w-[calc(100%-2rem)]",
    "max-w-lg",
    "-translate-x-1/2",
    "-translate-y-1/2",
    "rounded-[var(--george-radius-lg)]",
    "border",
    "border-[var(--george-border-subtle)]",
    "bg-[var(--george-color-surface-raised)]",
    "p-6",
    "text-[var(--george-color-text-primary)]",
    "shadow-[var(--george-shadow-overlay)]",
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--george-focus-color)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-black",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={classes}
        data-george-dialog-content=""
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function DialogHeader(
  {
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={["space-y-2", className].filter(Boolean).join(" ")}
      data-george-dialog-header=""
      {...props}
    />
  );
});

DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle(
  {
    className = "",
    ...props
  },
  ref,
) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={[
        "text-base",
        "font-semibold",
        "tracking-[-0.01em]",
        "text-[var(--george-color-text-primary)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-george-dialog-title=""
      {...props}
    />
  );
});

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription(
  {
    className = "",
    ...props
  },
  ref,
) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={[
        "text-sm",
        "leading-6",
        "text-[var(--george-color-text-secondary)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-george-dialog-description=""
      {...props}
    />
  );
});

DialogDescription.displayName = "DialogDescription";

export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function DialogFooter(
  {
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "mt-6",
        "flex",
        "items-center",
        "justify-end",
        "gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-george-dialog-footer=""
      {...props}
    />
  );
});

DialogFooter.displayName = "DialogFooter";
