import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import { RomanticBackground } from '@/components/RomanticBackground'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Our Little Compass',
  description: 'Guiding our adventures, together.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <RomanticBackground />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}