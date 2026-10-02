import { HomeConversationTypeSurface } from "@/components/home/HomeConversationTypeSurface";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="george-live-home-mask">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex h-[116px] items-start pt-4 sm:h-[132px]">
            <img
              src="/logofav.png"
              alt="Bx"
              className="h-[84px] w-[84px] object-contain sm:h-[96px] sm:w-[96px]"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-[124px] sm:px-8 sm:pt-[140px]">
        <header className="border-b border-white/[0.08] pb-8 pt-8 sm:pb-10 sm:pt-10">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#AEB6FF]/68">
            COMMUNICATION INTELLIGENCE
          </p>
          <h1 className="mt-4 max-w-3xl text-[20px] font-normal leading-[1.55] tracking-[-0.02em] text-white/78 sm:text-[24px] sm:leading-[1.5]">
            Answer in your own words. GEORGE can determine the next best question
            to materially improve the likelihood of a successful conclusion.
          </h1>
        </header>
      </div>

      <HomeConversationTypeSurface />
    </main>
  );
}
