"use client";

import { useEffect } from "react";

const SITE_BLUE = "#315bff";
const SITE_WHITE = "#ffffff";
const DARK_TEXT = "#050505";

type SavedStyle = {
  backgroundColor: string;
  borderColor: string;
  color: string;
  boxShadow: string;
  transform: string;
  transition: string;
};

const savedStyles = new WeakMap<HTMLElement, SavedStyle>();
const activeButtons = new WeakSet<HTMLElement>();

function getButton(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  return target.closest<HTMLElement>(
    'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], a[data-button]'
  );
}

function parseRgb(value: string): [number, number, number] | null {
  const match = value.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/
  );

  if (!match) return null;

  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
}

function classifyButton(button: HTMLElement): "blue" | "white" | null {
  const computed = window.getComputedStyle(button);
  const rgb = parseRgb(computed.backgroundColor);

  if (!rgb) return null;

  const [red, green, blue] = rgb;

  const isWhite =
    red >= 235 &&
    green >= 235 &&
    blue >= 235;

  const isBlue =
    blue >= 150 &&
    blue > red * 1.18 &&
    blue > green * 1.08 &&
    blue - Math.min(red, green) >= 45;

  if (isWhite) return "white";
  if (isBlue) return "blue";

  return null;
}

function activate(button: HTMLElement): void {
  if (
    activeButtons.has(button) ||
    button.matches(":disabled, [aria-disabled='true']")
  ) {
    return;
  }

  const kind = classifyButton(button);
  if (!kind) return;

  savedStyles.set(button, {
    backgroundColor: button.style.backgroundColor,
    borderColor: button.style.borderColor,
    color: button.style.color,
    boxShadow: button.style.boxShadow,
    transform: button.style.transform,
    transition: button.style.transition,
  });

  activeButtons.add(button);

  button.style.setProperty(
    "transition",
    [
      "background-color 140ms ease",
      "border-color 140ms ease",
      "color 140ms ease",
      "box-shadow 140ms ease",
      "transform 90ms ease",
    ].join(", "),
    "important"
  );

  if (kind === "blue") {
    button.style.setProperty("background-color", SITE_WHITE, "important");
    button.style.setProperty("border-color", SITE_WHITE, "important");
    button.style.setProperty("color", DARK_TEXT, "important");
  } else {
    button.style.setProperty("background-color", SITE_BLUE, "important");
    button.style.setProperty("border-color", SITE_BLUE, "important");
    button.style.setProperty("color", SITE_WHITE, "important");
  }

  button.style.setProperty("box-shadow", "none", "important");
}

function press(button: HTMLElement): void {
  activate(button);
  button.style.setProperty("transform", "scale(0.985)", "important");
}

function releasePress(button: HTMLElement): void {
  if (!activeButtons.has(button)) return;
  button.style.setProperty("transform", "scale(1)", "important");
}

function restore(button: HTMLElement): void {
  const saved = savedStyles.get(button);
  if (!saved) return;

  const restoreProperty = (
    property: string,
    value: string
  ): void => {
    if (value) {
      button.style.setProperty(property, value);
    } else {
      button.style.removeProperty(property);
    }
  };

  restoreProperty("background-color", saved.backgroundColor);
  restoreProperty("border-color", saved.borderColor);
  restoreProperty("color", saved.color);
  restoreProperty("box-shadow", saved.boxShadow);
  restoreProperty("transform", saved.transform);
  restoreProperty("transition", saved.transition);

  savedStyles.delete(button);
  activeButtons.delete(button);
}

export function UniversalButtonFeedback() {
  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      const button = getButton(event.target);
      if (!button) return;

      const from = event.relatedTarget;
      if (from instanceof Node && button.contains(from)) return;

      activate(button);
    };

    const onPointerOut = (event: PointerEvent) => {
      const button = getButton(event.target);
      if (!button) return;

      const to = event.relatedTarget;
      if (to instanceof Node && button.contains(to)) return;

      if (document.activeElement !== button) {
        restore(button);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const button = getButton(event.target);
      if (button) press(button);
    };

    const onPointerUp = (event: PointerEvent) => {
      const button = getButton(event.target);
      if (button) releasePress(button);
    };

    const onFocusIn = (event: FocusEvent) => {
      const button = getButton(event.target);
      if (button) activate(button);
    };

    const onFocusOut = (event: FocusEvent) => {
      const button = getButton(event.target);
      if (button) restore(button);
    };

    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("pointerout", onPointerOut, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);

    return () => {
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("pointerout", onPointerOut, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
    };
  }, []);

  return null;
}
