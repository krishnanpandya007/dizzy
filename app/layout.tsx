import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'

import './globals.css'

const _rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' })

export const metadata: Metadata = {
  title: 'Dizzy',
  description: 'Your personal app launcher',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#000000',
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
    <html lang="en">
      <body className={`${_rubik.variable} font-sans antialiased`}>
        <ServiceWorkerRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
