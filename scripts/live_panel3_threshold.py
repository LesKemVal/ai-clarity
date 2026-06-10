from pathlib import Path
import re
import sys

path = Path("app/george/live-entry/LiveEntryClient.tsx")
text = path.read_text()

backup = path.with_suffix(".tsx.bak.panel3")
backup.write_text(text)

# Hard copy corrections.
text = text.replace("START VOICE CHECK", "LET'S GO TO WORK")
text = text.replace("Start Voice Check", "LET'S GO TO WORK")
text = text.replace("start voice check", "LET'S GO TO WORK")
text = text.replace("voice check", "proof of awareness")
text = text.replace("Voice check", "Proof of awareness")

# Remove diagnostic language from Panel 3 copy if present.
text = text.replace(
    "Before we begin, tell me something I should know. Anything. I can hear you.",
    "Before we begin…"
)

# Make the visible proof area render like LIVE transcript instead of setup text.
old_panel_copy = """Proof of awareness."""
if old_panel_copy in text and "proofTranscript" not in text:
    insert_state = """
  const [proofTranscript, setProofTranscript] = useState<Array<{ speaker: 'george' | 'user'; text: string }>>([
    { speaker: 'george', text: 'Before we begin…' },
  ])
  const [proofInProgress, setProofInProgress] = useState(false)
  const [proofComplete, setProofComplete] = useState(false)
"""
    text = text.replace(
        "  const [founderAccessReady, setFounderAccessReady] = useState(false)\n",
        "  const [founderAccessReady, setFounderAccessReady] = useState(false)\n" + insert_state
    )

    proof_logic = r"""
  const appendProofTranscript = (speaker: 'george' | 'user', message: string) => {
    setProofTranscript((current) => [...current, { speaker, text: message }])
  }

  const speakProofLine = async (message: string) => {
    appendProofTranscript('george', message)

    try {
      const response = await fetch('/api/george/live/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      })

      if (!response.ok) return

      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)

      await new Promise<void>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        void audio.play().catch(resolve)
      })
    } catch {}
  }

  const beginProofOfAwareness = async () => {
    if (proofInProgress) return
    if (proofComplete) {
      startLive(false, editableResources, true)
      return
    }

    setProofInProgress(true)
    setProofTranscript([])

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
        : null

    let heardUser = false
    let recognition: any = null

    const listenOnce = (timeoutMs = 2800) =>
      new Promise<string>((resolve) => {
        if (!SpeechRecognition) {
          window.setTimeout(() => resolve(''), timeoutMs)
          return
        }

        recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.continuous = false
        recognition.interimResults = false

        const timer = window.setTimeout(() => {
          try { recognition.stop() } catch {}
          resolve('')
        }, timeoutMs)

        recognition.onresult = (event: any) => {
          const transcript = String(event?.results?.[0]?.[0]?.transcript || '').trim()
          window.clearTimeout(timer)
          resolve(transcript)
        }

        recognition.onerror = () => {
          window.clearTimeout(timer)
          resolve('')
        }

        recognition.onend = () => {}

        try {
          recognition.start()
        } catch {
          window.clearTimeout(timer)
          resolve('')
        }
      })

    const askAndListen = async (line: string) => {
      await speakProofLine(line)
      const heard = await listenOnce()
      if (heard) {
        heardUser = true
        appendProofTranscript('user', heard)
      }
      return heard
    }

    const first = await askAndListen('Before we begin… Tell me something I should know.')
    if (!first) {
      const second = await askAndListen('Anything?')
      if (!second) {
        const third = await askAndListen('Come on. I can hear you.')
        if (!third) {
          await speakProofLine('Okay. Let’s go to work.')
        }
      }
    }

    if (heardUser) {
      await speakProofLine('Understood. I’ll keep that in mind. Let’s go to work.')
    }

    setProofComplete(true)
    setProofInProgress(false)
    startLive(false, editableResources, true)
  }
"""
    anchor = "  if (!ready) return null\n"
    text = text.replace(anchor, proof_logic + "\n" + anchor)

# Replace any button action around LET'S GO TO WORK to run proof first, not a separate voice check.
text = re.sub(
    r"onClick=\{\(\) => startLive\(false, editableResources, true\)\}",
    "onClick={beginProofOfAwareness}",
    text
)

# If a legacy proof button has an explicit disabled state tied to old voice check, normalize it.
text = text.replace("disabled={!proofComplete}", "disabled={proofInProgress}")
text = text.replace("disabled={proofComplete}", "disabled={proofInProgress}")

path.write_text(text)

print("Updated Panel 3 threshold behavior.")
print(f"Backup saved to {backup}")
