import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Chakra_Petch, Barlow } from 'next/font/google'
import './globals.css'

const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})
const body = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'LunaOps — Junior Astronaut Mission Trainer',
  description:
    'Build a lunar outpost, lead four astronauts, balance critical resources, and survive a 30-day Moon mission.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#04070d',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${display.variable} ${body.variable}`}>
      <body className="bg-[#04070d] font-body text-slate-100 antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
