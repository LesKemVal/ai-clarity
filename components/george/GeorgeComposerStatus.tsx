type GeorgeComposerStatusProps = {
  thinking?: boolean
  className?: string
}

export function GeorgeComposerStatus({
  thinking = false,
  className = '',
}: GeorgeComposerStatusProps) {
  return (
    <div
      className={`george-composer-status ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="george-composer-brand" aria-hidden="true">
        BRANESX
      </div>

      <div
        className={`george-thinking-status ${
          thinking ? 'george-thinking-status--visible' : ''
        }`}
        aria-hidden={!thinking}
      >
        <span className="george-thinking-owner">GEORGE</span>
        <span className="george-thinking-copy">I&apos;m thinking...</span>
      </div>
    </div>
  )
}
