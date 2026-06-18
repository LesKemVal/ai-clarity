'use client'

import { useGeorgeLiveHub } from '@/hooks/george/live-hub/useGeorgeLiveHub'

export default function LiveHubActionTestPage() {
  const hub = useGeorgeLiveHub()

  return (
    <main className="min-h-screen bg-[#030405] px-6 py-8 text-white">
      <section className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-[#AEB6FF]/60">
          GEORGE LIVE HUB
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
          Action Cue Test
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          This page listens only for ACTION_CUE events from the deployed hub.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              hub.connect({
                room: 'test room',
                chair: 'founder',
                objective: 'close interest',
                knownContext: 'ACTION_CUE bridge test',
              })
            }
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
          >
            Connect
          </button>

          <button
            type="button"
            onClick={hub.startMic}
            className="rounded-xl border border-[#AEB6FF]/30 px-4 py-3 text-sm font-semibold text-[#D7DBE4]"
          >
            Start Mic
          </button>

          <button
            type="button"
            onClick={hub.stopMic}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70"
          >
            Stop Mic
          </button>

          <button
            type="button"
            onClick={hub.disconnect}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70"
          >
            Disconnect
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/60">
          Status: {hub.status}
          {hub.error && <div className="mt-2 text-red-200">{hub.error}</div>}
        </div>

        <div className="mt-8 rounded-3xl border border-[#AEB6FF]/15 bg-white/[0.035] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-[#AEB6FF]/55">
            Current ACTION_CUE
          </div>

          {hub.lastActionCue ? (
            <>
              <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                {hub.lastActionCue.cue}
              </div>

              <div className="mt-4 text-sm leading-6 text-white/50">
                {hub.lastActionCue.reason}
              </div>

              <div className="mt-4 text-xs leading-5 text-white/35">
                <div>source: {hub.lastActionCue.source}</div>
                <div>local: {hub.lastActionCue.localCue}</div>
                {hub.lastActionCue.fastCue && <div>fast: {hub.lastActionCue.fastCue}</div>}
                <div>category: {hub.lastActionCue.category}</div>
                <div>confidence: {hub.lastActionCue.confidence}</div>
                <div>priority: {hub.lastActionCue.priority}</div>
              </div>
            </>
          ) : (
            <div className="mt-4 text-lg text-white/38">
              Waiting for action cue.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
