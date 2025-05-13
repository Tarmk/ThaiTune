import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import I18nProvider from "./providers/i18n-provider"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { ThemeProvider } from "./providers/theme-provider"
import AuthProvider from "./providers/auth-provider"
import PageTransitionProvider from "./components/common/PageTransitionProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ThaiTune - Traditional Thai Music Database",
  description: "Explore and contribute to the world of Traditional Thai Music",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <PageTransitionProvider>
                <I18nProvider>{children}</I18nProvider>
              </PageTransitionProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
