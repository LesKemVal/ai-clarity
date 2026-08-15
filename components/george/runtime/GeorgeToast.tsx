"use client";

type GeorgeToastProps = {
  show: boolean;
  message: string;
};

export function GeorgeToast({
  show,
  message,
}: GeorgeToastProps) {
  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
      <div className="rounded-full border border-white/[0.05] bg-white/[0.018]/95 px-4 py-1.5 text-sm text-[#D7DBE4] shadow-[0_24px_72px_rgba(0,0,0,0.46)] ">
        {message}
      </div>
    </div>
  );
}
