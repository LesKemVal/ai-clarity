import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MobileHeaderGate from '@/components/layout/MobileHeaderGate'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'GEORGE by BRANESx',
    template: '%s | GEORGE',
  },
  description: 'Build it. Change it. Tear it down responsibly. Get all the way there with GEORGE.',
  applicationName: 'GEORGE',
  appleWebApp: {
    title: 'GEORGE',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'GEORGE by BRANESx',
    description: 'Want to get something done? GEORGE is your guide.',
    siteName: 'BRANESx',
    url: 'https://www.branesx.com/george',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'GEORGE by BRANESx',
    description: 'Want to get something done? GEORGE is your guide.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7C8CFF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col bg-black text-neutral-100 touch-manipulation font-[var(--font-inter)]">
        <MobileHeaderGate />
        <div className="flex-1 pt-[max(env(safe-area-inset-top),0px)]">
          {children}
        </div>
      </body>
    </html>
  )
}
