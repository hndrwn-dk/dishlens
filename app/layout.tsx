import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DishLens - Turn your fridge into dinner',
  description: 'AI-powered recipe generation from your fridge ingredients',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}