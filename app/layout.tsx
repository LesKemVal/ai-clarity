import { UniversalButtonFeedback } from "@/components/ui/UniversalButtonFeedback";
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './operational-overrides.css'
import MobileHeaderGate from '@/components/layout/MobileHeaderGate'
import LanguageRailSupport from '@/components/george/LanguageRailSupport'
import SidebarAccountDropdownEnhancer from '@/components/george/SidebarAccountDropdownEnhancer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.branesx.com'),
  title: {
    default: 'GEORGE by BRANESx',
    template: '%s | GEORGE',
  },
  description: 'GEORGE helps you prepare, respond, and keep momentum when timing, pressure, and words matter.',
  applicationName: 'GEORGE',
  icons: {
    icon: [{ url: '/logofav.png', type: 'image/png' }],
    shortcut: '/logofav.png',
    apple: '/logofav.png',
  },
  appleWebApp: {
    title: 'GEORGE',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'GEORGE by BRANESx',
    description: 'Prepare. Respond. Keep momentum when timing, pressure, and words matter.',
    siteName: 'BRANESx',
    url: 'https://www.branesx.com/george',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'GEORGE by BRANESx',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GEORGE by BRANESx',
    description: 'Prepare. Respond. Keep momentum when timing, pressure, and words matter.',
    images: ['/opengraph-image'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#06070A',
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
        <UniversalButtonFeedback />
        <MobileHeaderGate />
        <LanguageRailSupport />
        <SidebarAccountDropdownEnhancer />

        <div className="flex-1 pt-[max(env(safe-area-inset-top),0px)]">
          {children}
        </div>
      </body>
    </html>
  )
}
