"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./george-page-guide.css";

type GeorgePageGuideProps = {
  pageId: string;
  steps: DriveStep[];
  autoStart?: boolean;
};

const STORAGE_PREFIX = "GEORGE_PAGE_GUIDE";

function enabledKey(pageId: string) {
  return `${STORAGE_PREFIX}:${pageId}:enabled`;
}

function completedKey(pageId: string) {
  return `${STORAGE_PREFIX}:${pageId}:completed`;
}

function readBoolean(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;

  const value = window.localStorage.getItem(key);

  if (value === "true") return true;
  if (value === "false") return false;

  return fallback;
}

export default function GeorgePageGuide({
  pageId,
  steps,
  autoStart = false,
}: GeorgePageGuideProps) {
  const [enabled, setEnabled] = useState(true);
  const guideRef = useRef<Driver | null>(null);
  const stepsRef = useRef(steps);

  stepsRef.current = steps;

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const initialEnabled = readBoolean(enabledKey(pageId), true);
    setEnabled(initialEnabled);

    return () => {
      if (guideRef.current?.isActive()) {
        guideRef.current.destroy();
      }

      guideRef.current = null;
    };
  }, [pageId]);

  const startGuide = useCallback(() => {
    if (!stepsRef.current.length) return;

    if (guideRef.current?.isActive()) {
      guideRef.current.destroy();
    }

    const guide = driver({
      animate: !reducedMotion,
      duration: reducedMotion ? 0 : 320,
      smoothScroll: !reducedMotion,
      allowClose: true,
      overlayClickBehavior: "close",
      overlayOpacity: 0.72,
      stagePadding: 12,
      stageRadius: 18,
      popoverOffset: 12,
      skipMissingElement: true,
      popoverClass: "george-page-guide-popover",
      showProgress: true,
      progressText: "{{current}} / {{total}}",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      showButtons: ["next", "previous", "close"],
      steps: stepsRef.current,
      onDoneClick: (_element, _step, { driver: activeGuide }) => {
        window.localStorage.setItem(completedKey(pageId), "true");
        activeGuide.destroy();
        guideRef.current = null;
      },
      onDestroyed: () => {
        guideRef.current = null;
      },
    });

    guideRef.current = guide;

    window.requestAnimationFrame(() => {
      guide.drive(0);
    });
  }, [pageId, reducedMotion]);

  useEffect(() => {
    if (!autoStart || !enabled || !stepsRef.current.length) return;

    const completed = readBoolean(completedKey(pageId), false);

    if (completed) return;

    const timer = window.setTimeout(() => {
      startGuide();
    }, 650);

    return () => window.clearTimeout(timer);
  }, [autoStart, enabled, pageId, startGuide]);

  function toggleGuide() {
    const next = !enabled;

    setEnabled(next);
    window.localStorage.setItem(enabledKey(pageId), String(next));

    if (!next && guideRef.current?.isActive()) {
      guideRef.current.destroy();
    }
  }

  function replayGuide() {
    window.localStorage.setItem(enabledKey(pageId), "true");
    window.localStorage.setItem(completedKey(pageId), "false");
    setEnabled(true);
    startGuide();
  }

  return (
    <div
      data-george-page-guide-controls
      className="flex items-center gap-2"
    >
      <button
        type="button"
        onClick={toggleGuide}
        aria-pressed={enabled}
        className="whitespace-nowrap rounded-[0.5rem] border border-white/[0.055] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 transition hover:border-white/[0.1] hover:text-white/72 sm:px-2.5 sm:text-[9px]"
      >
        Guide {enabled ? "On" : "Off"}
      </button>

      <button
        type="button"
        onClick={replayGuide}
        className="whitespace-nowrap rounded-[0.5rem] border border-white/[0.055] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 transition hover:border-white/[0.1] hover:text-white/72 sm:px-2.5 sm:text-[9px]"
      >
        Show me around
      </button>
    </div>
  );
}
