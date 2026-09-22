"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type RouteCard = {
  id: string;
  kicker: string;
  title: string;
  href: string;
  action: string;
  description: string;
  georgeAction: string;
  accent?: boolean;
};

const routes: RouteCard[] = [
  {
    id: "normal",
    kicker: "NORMAL GEORGE",
    title: "Ask GEORGE.",
    href: "/george",
    action: "ASK GEORGE",
    description:
      "Plan, decide, build, write, compare options, research, or work through uncertainty.",
    georgeAction:
      "I’ll understand what you’re trying to accomplish, then help determine the strongest next move.",
  },
  {
    id: "traditional",
    kicker: "TRADITIONAL LIVE",
    title: "Prepare the room.",
    href: "/george/live-entry?source=start",
    action: "BEGIN TRADITIONAL LIVE",
    accent: true,
    description:
      "Prepare a specific conversation deliberately before LIVE begins.",
    georgeAction:
      "I’ll build the briefing around the interaction, what you need from it, and how I should support you in the room.",
  },
  {
    id: "role",
    kicker: "ROLE FIRST",
    title: "Start from your position.",
    href: "/george/live-home",
    action: "START ROLE FIRST",
    description:
      "Begin with your role, responsibility, or position in the conversation.",
    georgeAction:
      "I’ll use your position to determine what matters next, then build the conversation around the outcome you need.",
  },
  {
    id: "strategy",
    kicker: "OPERATIONAL STRATEGY",
    title: "Work with what you know.",
    href: "/george/library",
    action: "OPEN STRATEGY LIBRARY",
    description:
      "Review the formulas, scripts, execution history, and operational material already available to you.",
    georgeAction:
      "I’ll help you use what already exists, compare it against the objective, and determine whether another strategy is stronger.",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [renderedAction, setRenderedAction] = useState("");
  const transitionTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }

      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const beginRoute = (route: RouteCard) => {
    if (selectedRoute) return;

    setSelectedRoute(route.id);
    setRenderedAction("");

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setRenderedAction(route.georgeAction);

      transitionTimerRef.current = window.setTimeout(() => {
        router.push(route.href);
      }, 650);

      return;
    }

    let index = 0;

    typingTimerRef.current = window.setInterval(() => {
      index += 1;
      setRenderedAction(route.georgeAction.slice(0, index));

      if (index >= route.georgeAction.length) {
        if (typingTimerRef.current) {
          window.clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }

        transitionTimerRef.current = window.setTimeout(() => {
          router.push(route.href);
        }, 420);
      }
    }, 12);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto flex max-w-6xl items-center px-6 pt-5 sm:px-8 sm:pt-6">
        <img
          src="/logofav.png"
          alt="BRANESx"
          className="h-[70px] w-[70px] object-contain sm:h-[78px] sm:w-[78px]"
        />
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-14 pt-8 sm:px-8 sm:pt-10">
        <div className="mb-7 sm:mb-9">
          <p className="font-[var(--font-roboto-mono)] text-[10px] uppercase tracking-[0.22em] text-white/28">
            GEORGE · OPERATIONAL INTELLIGENCE
          </p>

          <h1 className="mt-3 font-[var(--font-roboto)] text-[30px] font-normal leading-[1.1] tracking-[-0.035em] text-white/88 sm:text-[40px]">
            Choose how you want to begin.
          </h1>
        </div>

        <section className="grid gap-x-10 gap-y-4 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-8">
          {routes.map((route) => {
            const selected = selectedRoute === route.id;
            const anotherSelected =
              selectedRoute !== null && selectedRoute !== route.id;

            return (
              <article
                key={route.id}
                className={`flex min-h-[310px] flex-col justify-between py-7 transition-opacity duration-300 sm:min-h-[340px] sm:py-8 ${
                  anotherSelected ? "opacity-30" : "opacity-100"
                }`}
              >
                <div>
                  <p
                    className={`font-[var(--font-roboto-mono)] text-[10px] uppercase tracking-[0.22em] ${
                      route.accent ? "text-[#7EA1FF]/78" : "text-white/30"
                    }`}
                  >
                    {route.kicker}
                  </p>

                  <h2 className="mt-4 max-w-xl font-[var(--font-roboto)] text-[31px] font-normal leading-[1.06] tracking-[-0.04em] text-white/82 sm:text-[40px]">
                    {route.title}
                  </h2>

                  <div
                    className="mt-7 min-h-[112px]"
                    aria-live={selected ? "polite" : undefined}
                  >
                    {!selected ? (
                      <p className="max-w-[36rem] font-[var(--font-roboto)] text-[15px] leading-[1.62] tracking-[-0.01em] text-white/48 sm:text-[16px]">
                        {route.description}
                      </p>
                    ) : (
                      <p className="max-w-[36rem] font-[var(--font-roboto)] text-[15px] leading-[1.62] tracking-[-0.01em] text-white/72 sm:text-[16px]">
                        {renderedAction}
                        <span
                          className="ml-[2px] inline-block text-white/48"
                          aria-hidden="true"
                        >
                          ▍
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={route.href}
                  onClick={(event) => {
                    event.preventDefault();
                    beginRoute(route);
                  }}
                  aria-disabled={Boolean(selectedRoute)}
                  className={`mt-8 inline-flex w-fit items-center gap-4 rounded-full px-5 py-3 font-[var(--font-roboto-mono)] text-[11px] uppercase tracking-[0.15em] transition ${
                    route.accent
                      ? "bg-[#101831] text-[#AFC0FF] hover:bg-[#152041] hover:text-white"
                      : "bg-white/[0.055] text-white/58 hover:bg-white/[0.09] hover:text-white/88"
                  } ${
                    anotherSelected
                      ? "pointer-events-none"
                      : ""
                  }`}
                >
                  <span>{selected ? "PREPARING" : route.action}</span>

                  {!selected && (
                    <span aria-hidden="true">→</span>
                  )}
                </Link>
              </article>
            );
          })}
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-white/[0.055] pt-7">
          <div className="font-[var(--font-roboto-mono)] text-[9px] uppercase tracking-[0.18em] text-white/22">
            PREPARE · EXECUTE · ADAPT
          </div>

          <div className="flex items-center gap-6 font-[var(--font-roboto)] text-[13px] text-white/34">
            <Link
              href="/george/marketplace"
              className="transition hover:text-white/72"
            >
              Marketplace
            </Link>

            <Link
              href="/help"
              className="transition hover:text-white/72"
            >
              Help
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
