// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from './providers'
import ThemeWrapper from '@/components/ThemeWrapper'
import { THEMES } from '@/utils/theme'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Supplement Hub - Your Nutrition Destination',
  description: 'Premium supplements and nutrition products for fitness enthusiasts',
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" className="light">
      <body 
        className={`
          ${THEMES.light.background.primary}
          ${THEMES.light.text.primary}
          min-h-screen
          ${inter.className}
        `}
      >
        <Providers>
          <ThemeWrapper>
              <main>
                <Header />
                {children}
                <Footer />
              </main>
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  )
}