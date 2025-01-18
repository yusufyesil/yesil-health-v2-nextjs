import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { LemonSqueezyScript } from '@/components/LemonSqueezyScript'

export const metadata: Metadata = {
  title: 'Yesil AI Virtual Hospital',
  description: 'AI-powered medical consultations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>
      </head>
      <body className="overflow-hidden">
        <AuthProvider>
          <Header />
          {children}
          <LemonSqueezyScript />
        </AuthProvider>
      </body>
    </html>
  );
}
