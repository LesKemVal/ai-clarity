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

const tierCopy: Record<CheckoutTier, { label: string; line: string; confirm: string; descriptor: string }> = {
  intelligent: {
    label: 'Intelligent',
    line: 'LIVE runtime support, contextual recall, and continuity-aware execution.',
    confirm: 'Activate Intelligent',
    descriptor: 'Contextual recall · adaptive response shaping · operational memory carry',
  },
  brilliant: {
    label: 'Brilliant',
    line: 'Persistent LIVE runtime for pressure, timing, and real-time operational support.',
    confirm: 'Activate Brilliant',
    descriptor: 'Deeper contextual carry · pressure-aware cues · runtime support escalation',
  },
  brilliant_day: {
    label: 'Brilliant Day',
    line: 'Temporary access to GEORGE’s LIVE runtime and operational support layer.',
    confirm: 'Activate Day Access',
    descriptor: 'Temporary LIVE runtime · contextual carry · real-time guidance',
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
        colorBackground: '#05070B',
        colorText: '#E7EAF7',
        colorDanger: '#FCA5A5',
        colorSuccess: '#8FE7B0',
        colorTextSecondary: 'rgba(231,234,247,0.54)',
        colorTextPlaceholder: 'rgba(231,234,247,0.24)',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSizeBase: '14px',
        spacingUnit: '4px',
        borderRadius: '14px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#080B11',
          border: '1px solid rgba(255,255,255,0.075)',
          boxShadow: 'none',
          color: '#E7EAF7',
          padding: '10px 12px',
        },
        '.Input:focus': {
          border: '1px solid rgba(170,180,255,0.30)',
          boxShadow: '0 0 0 1px rgba(170,180,255,0.10)',
        },
        '.Label': {
          color: 'rgba(231,234,247,0.50)',
          fontSize: '12px',
          letterSpacing: '0.02em',
        },
        '.Tab': {
          backgroundColor: 'rgba(255,255,255,0.010)',
          border: '1px solid rgba(255,255,255,0.045)',
          boxShadow: 'none',
          color: 'rgba(231,234,247,0.62)',
        },
        '.Tab:hover': {
          backgroundColor: 'rgba(170,180,255,0.050)',
          color: '#E7EAF7',
        },
        '.Tab--selected': {
          backgroundColor: 'rgba(170,180,255,0.075)',
          border: '1px solid rgba(170,180,255,0.22)',
          boxShadow: '0 0 0 1px rgba(170,180,255,0.060)',
          color: '#D7DCFF',
        },
        '.Block': {
          backgroundColor: '#070A10',
          border: '1px solid rgba(255,255,255,0.055)',
          boxShadow: 'none',
        },
        '.AccordionItem': {
          backgroundColor: '#070A10',
          border: '1px solid rgba(255,255,255,0.055)',
          boxShadow: 'none',
        },
        '.Text': {
          color: 'rgba(231,234,247,0.58)',
        },
      },
    }),
    []
  )

  async function preparePaymentElement(targetEmail = email) {
    setLoading(true)
    setReady(false)
    setError('')
    setStatus('Preparing runtime activation...')

    try {
      await loadStripeScript()

      const response = await fetch('/api/subscribe/payment-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, email: targetEmail }),
      })

      const data = (await response.json().catch(() => ({}))) as PaymentElementResponse

      if (!response.ok || !data.clientSecret || !data.publishableKey || !data.returnUrl) {
        setError(data.error || 'Unable to prepare runtime activation.')
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
        loader: 'always',
      })

      const paymentElement = stripeElements.create('payment', {
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
          radios: false,
          spacedAccordionItems: false,
        },
        paymentMethodOrder: ['card'],
        defaultValues: targetEmail.trim() ? { billingDetails: { email: targetEmail.trim() } } : undefined,
        wallets: {
          applePay: 'never',
          googlePay: 'never',
        },
      })

      paymentElement.mount('#george-payment-element')

      setStripe(stripeInstance)
      setElements(stripeElements)
      setIntentType(data.intentType === 'setup' ? 'setup' : 'payment')
      setReturnUrl(data.returnUrl)
      setReady(true)
      setStatus('Runtime activation is ready.')
    } catch {
      setError('Unable to prepare runtime activation.')
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
    setStatus('Confirming runtime activation...')

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
    <div className="w-full">
      <div className="relative w-full overflow-hidden rounded-[1rem] border border-white/[0.035] bg-[#0B0D12] shadow-[0_24px_70px_rgba(0,0,0,0.46)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(170,180,255,0.055),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(126,201,218,0.035),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_42%)]" />

        <div className="relative border-b border-white/[0.04] px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.30em] text-[#C9D0FF]/48">
                Runtime activation
              </p>
              <div>
                <h2 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-white md:text-[1.6rem]">
                  {copy.label}
                </h2>
                <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-white/46">
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

        <form onSubmit={confirmActivation} className="relative space-y-3 px-3.5 py-3.5 md:px-5 md:py-5">
          <div className="rounded-[0.85rem] border border-white/[0.035] bg-black/20 p-3">
            <label className="text-[11px] uppercase tracking-[0.18em] text-white/38">
              Continuity email
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="min-h-[42px] flex-1 rounded-[0.75rem] border border-white/[0.045] bg-[#10131B]/74 px-4 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[#AAB4FF]/30 focus:bg-[#10131B]"
              />
              <button
                type="button"
                onClick={() => preparePaymentElement(email)}
                disabled={loading}
                className="rounded-[0.75rem] border border-white/[0.055] bg-white/[0.014] px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white/58 transition hover:border-white/[0.10] hover:bg-white/[0.030] hover:text-white/76 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Bind continuity
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-white/28">
              Used only for continuity and restoration.
            </p>
          </div>

          <div className="rounded-[0.9rem] border border-white/[0.06] bg-[#05070B] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.024)] md:p-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/30">
              Payment method
            </p>
            <div id="george-payment-element" className="min-h-[220px] rounded-[0.8rem] bg-[#05070B]" />
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

          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="submit"
              disabled={!ready || submitting || loading}
              className="rounded-[0.78rem] border border-[#AAB4FF]/22 bg-[#AAB4FF]/[0.085] px-5 py-3 text-sm font-semibold text-[#D7DCFF] transition hover:bg-[#AAB4FF]/[0.13] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitting ? 'Activating runtime...' : copy.confirm}
            </button>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onLegacyCheckout(tier)}
                className="text-left text-[11px] font-medium uppercase tracking-[0.18em] text-white/24 transition hover:text-white/52"
              >
                Classic checkout fallback
              </button>
              <p className="max-w-xs text-[11px] leading-4 text-white/20">
                Use only if native runtime activation cannot complete.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
