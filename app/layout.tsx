import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Coach & Companion - Your Personal Growth Partner',
  description: 'Transform your life with our AI coach and companion. Get personalized guidance, emotional support, and achieve your goals with cutting-edge AI technology.',
  keywords: 'AI coach, AI companion, personal growth, life coaching, emotional support, goal tracking, personal development',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 