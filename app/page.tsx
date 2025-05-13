"use client"

import { useEffect, useState } from "react"
import Footer from "@/app/components/layout/Footer"
import Main from "@/app/components/layout/Main"
import { TopMenu } from "@/app/components/layout/TopMenu"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

export default function HomePage() {
  const [language, setLanguage] = useState("en")
  const [isClient, setIsClient] = useState(false)
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  
  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Show loading state until client-side rendering is ready
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col">
        <div className="h-16 w-full bg-white dark:bg-[#1a1f2c] border-b border-gray-100 dark:border-gray-800"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 w-72 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      <TopMenu />
      <Main />
      <Footer />
    </div>
  )
}
