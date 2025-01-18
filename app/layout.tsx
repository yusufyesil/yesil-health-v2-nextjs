import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { LemonSqueezyScript } from '@/components/LemonSqueezyScript'

export const metadata: Metadata = {
  title: 'Yesil AI Virtual Hospital',
  description: 'AI-powered medical consultations',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="touch-manipulation">
      <head>
        <script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          {children}
          <LemonSqueezyScript />
        </AuthProvider>
      </body>
    </html>
  );
}
