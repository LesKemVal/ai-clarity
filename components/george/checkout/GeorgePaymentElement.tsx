'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type CheckoutTier = 'intelligent' | 'brilliant' | 'brilliant_day'
type IntentType = 'payment' | 'setup'

type GeorgePaymentElementProps = {
  tier: CheckoutTier
  onClose: () => void
  onLegacyCheckout: (tier: CheckoutTier) => void
}

type PaymentElementResponse = {
  clientSecret?: string
  publishableKey?: string
  returnUrl?: string
  intentType?: IntentType
  error?: string
}

type StripeElements = {
  create: (type: 'payment', options?: Record<string, unknown>) => {
    mount: (selector: string) => void
    unmount?: () => void
  }
  submit: () => Promise<{ error?: { message?: string } }>
}

type StripeInstance = {
  elements: (options: Record<string, unknown>) => StripeElements
  confirmPayment: (options: Record<string, unknown>) => Promise<{ error?: { message?: string } }>
  confirmSetup: (options: Record<string, unknown>) => Promise<{ error?: { message?: string } }>
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance | null
  }
}

const tierCopy: Record<CheckoutTier, { label: string; line: string; confirm: string }> = {
  intelligent: {
    label: 'Intelligent',
    line: 'Continuity, follow-through, and stronger execution support.',
    confirm: 'Activate Intelligent',
  },
  brilliant: {
    label: 'Brilliant',
    line: 'LIVE support for rooms where timing, wording, and pressure matter.',
    confirm: 'Activate Brilliant',
  },
  brilliant_day: {
    label: 'Brilliant Day',
    line: 'Temporary LIVE access for the room in front of you today.',
    confirm: 'Activate Day Access',
  },
}

function loadStripeScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve()
    if (window.Stripe) return resolve()

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]')

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Stripe failed to load.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Stripe failed to load.'))
    document.head.appendChild(script)
  })
}

export default function GeorgePaymentElement({ tier, onClose, onLegacyCheckout }: GeorgePaymentElementProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [stripe, setStripe] = useState<StripeInstance | null>(null)
  const [elements, setElements] = useState<StripeElements | null>(null)
  const [intentType, setIntentType] = useState<IntentType>('payment')
  const [returnUrl, setReturnUrl] = useState('')

  const copy = tierCopy[tier]

  const appearance = useMemo(
    () => ({
      theme: 'night',
      variables: {
        colorPrimary: '#AAB4FF',
        colorBackground: '#0B0D12',
        colorText: '#E7EAF7',
        colorDanger: '#FCA5A5',
        colorTextSecondary: 'rgba(231,234,247,0.58)',
        colorTextPlaceholder: 'rgba(231,234,247,0.28)',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSizeBase: '14px',
        spacingUnit: '4px',
        borderRadius: '12px',
      },
      rules: {
        '.Input': {
          backgroundColor: 'rgba(16,19,27,0.74)',
          border: '1px solid rgba(255,255,255,0.055)',
          boxShadow: 'none',
          color: '#E7EAF7',
        },
        '.Input:focus': {
          border: '1px solid rgba(170,180,255,0.30)',
          boxShadow: '0 0 0 1px rgba(170,180,255,0.10)',
        },
        '.Label': {
          color: 'rgba(231,234,247,0.58)',
          fontSize: '12px',
          letterSpacing: '0.02em',
        },
        '.Tab': {
          backgroundColor: 'rgba(255,255,255,0.012)',
          border: '1px solid rgba(255,255,255,0.045)',
          color: 'rgba(231,234,247,0.66)',
        },
        '.Tab--selected': {
          backgroundColor: 'rgba(170,180,255,0.075)',
          border: '1px solid rgba(170,180,255,0.22)',
          color: '#D7DCFF',
        },
        '.Block': {
          backgroundColor: 'rgba(255,255,255,0.010)',
          border: '1px solid rgba(255,255,255,0.040)',
        },
      },
    }),
    []
  )

  async function preparePaymentElement(targetEmail = email) {
    setLoading(true)
    setReady(false)
    setError('')
    setStatus('Preparing secure activation...')

    try {
      await loadStripeScript()

      const response = await fetch('/api/subscribe/payment-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, email: targetEmail }),
      })

      const data = (await response.json().catch(() => ({}))) as PaymentElementResponse

      if (!response.ok || !data.clientSecret || !data.publishableKey || !data.returnUrl) {
        setError(data.error || 'Unable to prepare the payment form.')
        setStatus('')
        return
      }

      const stripeInstance = window.Stripe?.(data.publishableKey) ?? null

      if (!stripeInstance) {
        setError('Unable to load secure payment controls.')
        setStatus('')
        return
      }

      const stripeElements = stripeInstance.elements({
        clientSecret: data.clientSecret,
        appearance,
      })

      const paymentElement = stripeElements.create('payment', {
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
        },
        defaultValues: targetEmail.trim() ? { billingDetails: { email: targetEmail.trim() } } : undefined,
      })

      paymentElement.mount('#george-payment-element')

      setStripe(stripeInstance)
      setElements(stripeElements)
      setIntentType(data.intentType === 'setup' ? 'setup' : 'payment')
      setReturnUrl(data.returnUrl)
      setReady(true)
      setStatus('Secure activation is ready.')
    } catch {
      setError('Unable to prepare the payment form.')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    preparePaymentElement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier])

  async function confirmActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements || !returnUrl) {
      setError('Secure payment form is not ready yet.')
      return
    }

    setSubmitting(true)
    setError('')
    setStatus('Confirming activation...')

    const submitResult = await elements.submit()

    if (submitResult.error) {
      setError(submitResult.error.message || 'Check the payment details and try again.')
      setStatus('')
      setSubmitting(false)
      return
    }

    const confirmation =
      intentType === 'setup'
        ? await stripe.confirmSetup({
            elements,
            confirmParams: { return_url: returnUrl },
          })
        : await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: returnUrl },
          })

    if (confirmation.error) {
      setError(confirmation.error.message || 'Activation could not be completed.')
      setStatus('')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-[#050608]/82 px-4 py-5 backdrop-blur-xl md:py-8">
      <button
        type="button"
        aria-label="Close payment activation"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
      />

      <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[1.1rem] border border-white/[0.045] bg-[#0B0D12] shadow-[0_32px_110px_rgba(0,0,0,0.72)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(170,180,255,0.10),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(126,201,218,0.07),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.030),transparent_42%)]" />

        <div className="relative border-b border-white/[0.045] px-5 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[#C9D0FF]/48">
                GEORGE ACTIVATION
              </p>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
                  {copy.label}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/48">
                  {copy.line}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/[0.045] bg-white/[0.012] px-3 py-1.5 text-xs text-white/46 transition hover:border-white/[0.10] hover:bg-white/[0.035] hover:text-white/76"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={confirmActivation} className="relative space-y-5 px-5 py-5 md:px-6 md:py-6">
          <div className="rounded-[0.85rem] border border-white/[0.035] bg-white/[0.010] p-4">
            <label className="text-[11px] uppercase tracking-[0.18em] text-white/38">
              Continuity email
            </label>
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="min-h-[46px] flex-1 rounded-[0.75rem] border border-white/[0.045] bg-[#10131B]/74 px-4 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[#AAB4FF]/30 focus:bg-[#10131B]"
              />
              <button
                type="button"
                onClick={() => preparePaymentElement(email)}
                disabled={loading}
                className="rounded-[0.75rem] border border-white/[0.055] bg-white/[0.014] px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white/58 transition hover:border-white/[0.10] hover:bg-white/[0.030] hover:text-white/76 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Bind
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/32">
              Used only to restore access and continuity after activation.
            </p>
          </div>

          <div className="rounded-[0.85rem] border border-white/[0.035] bg-[#080A0F]/86 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <div id="george-payment-element" className="min-h-[180px]" />
          </div>

          {(status || error) && (
            <div
              className={`rounded-[0.75rem] border px-4 py-3 text-sm ${
                error
                  ? 'border-red-300/15 bg-red-400/[0.045] text-red-100/78'
                  : 'border-[#AAB4FF]/14 bg-[#AAB4FF]/[0.040] text-[#D7DCFF]/78'
              }`}
            >
              {error || status}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/[0.04] pt-4 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => onLegacyCheckout(tier)}
              className="text-left text-xs font-medium uppercase tracking-[0.18em] text-white/32 transition hover:text-white/62"
            >
              Use classic checkout
            </button>

            <button
              type="submit"
              disabled={!ready || submitting || loading}
              className="rounded-[0.78rem] border border-[#AAB4FF]/22 bg-[#AAB4FF]/[0.085] px-5 py-3 text-sm font-semibold text-[#D7DCFF] transition hover:bg-[#AAB4FF]/[0.13] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? 'Activating...' : copy.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
