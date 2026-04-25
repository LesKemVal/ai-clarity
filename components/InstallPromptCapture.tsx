'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    __branesInstallPrompt?: any
  }
}

export default function InstallPromptCapture() {
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      window.__branesInstallPrompt = event
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return null
}
