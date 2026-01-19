import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientProviders } from "@/components/providers/ClientProviders"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Family Story Archive",
  description: "Preserve your family's stories for generations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen font-sans">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
