"use client";

import { useState } from "react";

type GeorgeContextHintProps = {
  title: string;
  description: string;
};

export default function GeorgeContextHint({
  title,
  description,
}: GeorgeContextHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="george-context-hint-trigger"
      >
        <span className="george-context-hint-dot" aria-hidden="true" />
        <span>HINT</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={title}
          className="george-context-hint-popover"
        >
          <button
            type="button"
            aria-label="Close hint"
            onClick={() => setOpen(false)}
            className="george-context-hint-close"
          >
            ×
          </button>

          <p className="george-context-hint-title">{title}</p>

          <p className="george-context-hint-description">
            {description}
          </p>

          <div className="george-context-hint-footer">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="george-context-hint-got-it"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
