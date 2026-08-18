import { HomeConversationTypeSurface } from "@/components/home/HomeConversationTypeSurface";

export default function GeorgeLiveHomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="george-live-home-mask">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex h-[116px] items-start pt-4 sm:h-[132px]">
            <img src="/logofav.png" alt="Bx" className="h-[84px] w-[84px] object-contain sm:h-[96px] sm:w-[96px]" />
          </div>
        </div>
      </div>

      <div className="pt-[124px] sm:pt-[140px]">
        <HomeConversationTypeSurface />
      </div>
    </main>
  );
}
