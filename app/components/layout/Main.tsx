"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MusicIcon, Code, Headphones, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/app/providers/auth-provider"

export default function Main() {
  const { t, ready } = useTranslation("common")
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()
  const { user } = useAuth()

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"
  const maroonDark = "#8A3D4C"

  // Show loading placeholder when translations aren't ready
  // or when not yet mounted on the client
  if (!ready || !isClient) {
    return (
      <main className="flex-1 pt-16 dark:bg-[#1a1f2c]">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="h-[600px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-12 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-6 w-72 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-[#1a1f2c] pt-16">
      {/* Hero Section */}
      <div className="w-full py-24">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-6xl/none leading-tight">
                  {t("learnTitle")}
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-300 max-w-[600px]">{t("description")}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {!user && (
                  <Link href="/signup">
                    <Button 
                      className="text-base px-6 py-3 shadow-md transition-transform hover:scale-105 bg-[#4A1D2C] hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-[#6A2D3C] text-white"
                    >
                      {t("getStarted")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/community">
                  <Button 
                    variant="outline" 
                    className="text-base px-6 py-3 border-[#4A1D2C] text-[#4A1D2C] dark:border-[#8A3D4C] dark:text-gray-200 hover:bg-[#F8F1F3] dark:hover:bg-[#232838]"
                  >
                    {t("exploreCommunity")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-[#4A1D2C] to-[#8A3D4C] flex items-center justify-center p-8">
                  <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl w-full h-full flex items-center justify-center">
                    <MusicIcon className="h-32 w-32 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full py-24 bg-white dark:bg-[#232838]">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 dark:text-white">{t("widenRepertoire")}</h2>
            <p className="text-xl text-gray-500 dark:text-gray-300 max-w-3xl mx-auto">{t("uploadDescription")}</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: <MusicIcon className="h-8 w-8" />, title: t("feature1Title"), description: t("feature1Desc") },
              { icon: <Code className="h-8 w-8" />, title: t("feature2Title"), description: t("feature2Desc") },
              { icon: <Headphones className="h-8 w-8" />, title: t("feature3Title"), description: t("feature3Desc") }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden dark:bg-[#2a3349] dark:border-none">
                <div className="h-1" style={{ background: `linear-gradient(to right, ${theme === 'dark' ? '#8A3D4C' : maroonColor}, ${theme === 'dark' ? '#af5169' : maroonLighter})` }} />
                <CardContent className="p-6">
                  <div 
                    className="rounded-full p-2 mb-5 inline-block" 
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(138, 61, 76, 0.2)' : maroonLightest,
                    }}
                  >
                    <div style={{ color: theme === 'dark' ? '#e5a3b4' : maroonColor }}>{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Editor Preview Section */}
      <div className="w-full py-24 bg-gray-50 dark:bg-[#1a1f2c]">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="space-y-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 dark:text-white">{t("advancedEditor")}</h2>
              <p className="text-xl text-gray-500 dark:text-gray-300">{t("editorDescription")}</p>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-[#2a3349] aspect-[2/1]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A1D2C]/5 to-[#8A3D4C]/5 dark:from-[#8A3D4C]/10 dark:to-[#af5169]/10"></div>
              <div className="w-full h-full relative">
                <Image
                  src="/images/music-editor-preview.png"
                  alt="Music Score Editor Interface"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
