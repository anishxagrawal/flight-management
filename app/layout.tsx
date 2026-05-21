import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SkyVoyage | Premium Flight Booking',
  description: 'Experience next-generation flight booking with real-time seat selection, cinematic animations, and premium design.',
  keywords: ['flight booking', 'airline tickets', 'travel', 'seat selection', 'premium flights'],
  authors: [{ name: 'SkyVoyage' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SkyVoyage',
  },
  openGraph: {
    type: 'website',
    title: 'SkyVoyage | Premium Flight Booking',
    description: 'Book flights with stunning real-time seat selection',
    siteName: 'SkyVoyage',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0c14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1117',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              color: '#ffffff',
            },
          }}
        />
      </body>
    </html>
  )
}
