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
    default: 'GEORGE by BRANESx',
    template: '%s | GEORGE',
  },
  description: 'Want to get something done? GEORGE is your guide.',
  applicationName: 'GEORGE',
  themeColor: '#7C8CFF',
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
        <div className="flex-1 pt-12 md:pt-0">
          {children}
        </div>
      </body>
    </html>
  )
}
