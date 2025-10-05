import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "StudentLink Portal - Bestlink College of the Philippines",
  description: "Student Concern Management System for Faculty and Staff",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link 
            rel="preload" 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Display:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" 
            as="style" 
          />
        </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
