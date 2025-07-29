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
  
  // Render immediately with SSR-safe approach instead of showing loading
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      <TopMenu />
      <Main />
      <Footer />
    </div>
  )
}
