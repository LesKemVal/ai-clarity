import renderAssistantContent from "@/components/george/GeorgeAssistantContent";
import MomentMarker from "@/components/george/MomentMarker";
import type { GeorgeMessage } from "@/lib/george/chat/message-types";

type GeorgeAssistantMessageProps = {
  message: GeorgeMessage;
  content: string;
  liveMode: boolean;
  forceLive: boolean;
};

export default function GeorgeAssistantMessage({
  message,
  content,
  liveMode,
  forceLive,
}: GeorgeAssistantMessageProps) {
  return (
    <div
      style={
        !liveMode && message.presentationMode === "live_preparation"
          ? {
              background:
                "linear-gradient(180deg, rgba(24,42,86,0.82), rgba(14,27,58,0.76))",
              borderColor: "rgba(69,105,188,0.32)",
              boxShadow: "0 12px 34px rgba(4,12,32,0.22)",
            }
          : undefined
      }
      data-george-message-presentation={
        message.presentationMode || undefined
      }
      className={`relative whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[15.5px] md:text-[15.8px] landscape:text-[18px] ${
        forceLive || liveMode ? "leading-[1.72]" : ""
      } landscape:leading-8 tracking-[0.002em] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-[#D7DBE4]/88 ${
        liveMode
          ? "w-fit max-w-[82%] text-left rounded-[0.6rem] border border-[#8FB6C9]/[0.045] bg-[linear-gradient(180deg,rgba(10,18,28,0.42),rgba(6,10,16,0.22))] px-3 py-2 shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
          : message.presentationMode === "live_preparation"
            ? "w-fit max-w-[min(92%,42rem)] self-start rounded-[0.95rem] border px-4 py-3 text-left"
            : "message-assistant max-w-full text-left px-1 py-2"
      }`}
    >
      {message.momentAssessment ? (
        <MomentMarker assessment={message.momentAssessment} />
      ) : null}

      {renderAssistantContent(content, liveMode)}
    </div>
  );
}
