import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ATC Tender Management',
  description: 'MVP for ATC Academy Sprint',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ar" dir="rtl">
        <body className="bg-gray-100 text-gray-900 font-sans min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}