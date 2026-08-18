export default function renderAssistantContent(text: string, liveMode: boolean) {
  const cleaned = String(text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^###\s+/gm, "")
    .replace(/^##\s+/gm, "")
    .replace(/^#\s+/gm, "")
    .trim();

  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={`flex flex-col ${liveMode ? "gap-7" : "gap-[1.15rem]"}`}>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const bulletLines = lines.filter((line) => /^[-•*]\s+/.test(line));

        const numberedLines = lines.filter((line) => /^\d+[.)]\s+/.test(line));

        if (
          lines.length > 1 &&
          (bulletLines.length === lines.length ||
            numberedLines.length === lines.length)
        ) {
          return (
            <div key={index}>
              {bulletLines.length === lines.length ? (
                <ul className="space-y-2.5">
                  {lines.map((line, i) => (
                    <li key={i}>{line.replace(/^[-•*]\s+/, "• ")}</li>
                  ))}
                </ul>
              ) : (
                <ol className="space-y-2.5">
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
              )}
            </div>
          );
        }

        return (
          <div key={index} className="flex flex-col gap-2.5">
            {lines.map((line, lineIndex) => {
              if (/^[-•*]\s+/.test(line)) {
                return (
                  <div key={lineIndex} className="pl-5 -indent-5">
                    {line.replace(/^[-•*]\s+/, "• ")}
                  </div>
                );
              }

              if (/^\d+[.)]\s+/.test(line)) {
                return (
                  <div key={lineIndex} className="pl-5 -indent-5">
                    {line}
                  </div>
                );
              }

              const routeLink = line.match(
                /^\[([^\]]+)\]\((\/[^)]+)\)$/,
              );

              if (routeLink) {
                return (
                  <div key={lineIndex}>
                    <a
                      href={routeLink[2]}
                      className="inline-flex items-center gap-1.5 border-b border-[#8FAEFF]/24 pb-[1px] font-medium text-[#BCC9F7]/78 transition duration-150 hover:border-[#AFC0FF]/58 hover:text-[#E3E9FF]"
                    >
                      {routeLink[1]}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                );
              }

              return <div key={lineIndex}>{line}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}
