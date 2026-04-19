import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import MobileHeaderGate from '@/components/layout/MobileHeaderGate'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'BRANES',
    template: '%s | BRANES',
  },
  description: 'Clarity. Execution. Continuity.',
  applicationName: 'BRANES',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-neutral-100 touch-manipulation">
        <MobileHeaderGate />
        <div className="flex-1 pt-16 md:pt-0">
          {children}
        </div>
      </body>
    </html>
  )
}
