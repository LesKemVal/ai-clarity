export default function TypingPrescriptionSurface() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[118px] z-[34] mx-auto w-full max-w-[430px] px-6 lg:hidden">
      <div className="relative h-[360px] overflow-hidden rounded-[1.6rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.055),transparent_42%),radial-gradient(circle_at_80%_75%,rgba(124,140,255,0.045),transparent_48%)]" />

        <div className="absolute left-[-18%] top-[18%] animate-[georgeGhostDrift_28s_ease-in-out_infinite] select-none text-[116px] font-semibold uppercase leading-none tracking-[-0.12em] text-white/[0.035]">
          NEXT
        </div>

        <div className="absolute right-[-22%] top-[52%] animate-[georgeGhostDriftSlow_36s_ease-in-out_infinite] select-none text-[92px] font-semibold uppercase leading-none tracking-[-0.10em] text-white/[0.026]">
          MOVE
        </div>

        <div className="absolute inset-x-0 top-[116px] text-center">
          <div className="text-[11px] uppercase tracking-[0.32em] text-[#F4F7FF]/38">
            GEORGE
          </div>

          <div className="mx-auto mt-6 max-w-[280px] text-[24px] font-light leading-[1.22] tracking-[-0.055em] text-[#F7F8FF]/82">
            Bring the situation.
            <br />
            Find the next useful move.
          </div>
        </div>
      </div>
    </div>
  )
}
