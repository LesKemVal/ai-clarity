import type { Metadata, Viewport } from 'next'
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
    default: 'BRANESx',
    template: '%s | BRANESx',
  },
  description: 'Clarity. Execution. Continuity.',
  applicationName: 'BRANESx',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
