"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MusicIcon, Code, Headphones, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function Main() {
  const { t, ready } = useTranslation("common")

  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"

  if (!ready) {
    return (
      <main className="flex-1 pt-16">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="h-[600px] flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-12 w-96 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 w-72 bg-gray-200 rounded mb-8"></div>
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="w-full py-24">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <div className="inline-block rounded-full px-3 py-1 text-sm font-medium" 
                  style={{ backgroundColor: maroonLightest, color: maroonColor }}>
                  {t("newFeature")}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 lg:text-5xl leading-relaxed overflow-visible">
                  {t("learnTitle")}
                </h1>
                <p className="text-xl text-gray-500 max-w-[600px]">{t("description")}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button 
                    className="text-base px-6 py-3 shadow-md transition-transform hover:scale-105"
                    style={{ backgroundColor: maroonColor }}
                  >
                    {t("getStarted")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/community">
                  <Button 
                    variant="ghost" 
                    className="text-base px-6 py-3 border"
                    style={{ borderColor: maroonColor, color: maroonColor }}
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
      <div className="w-full py-24 bg-white">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{t("widenRepertoire")}</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">{t("uploadDescription")}</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: <MusicIcon className="h-8 w-8" />, title: t("feature1Title"), description: t("feature1Desc") },
              { icon: <Code className="h-8 w-8" />, title: t("feature2Title"), description: t("feature2Desc") },
              { icon: <Headphones className="h-8 w-8" />, title: t("feature3Title"), description: t("feature3Desc") }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <div className="h-1" style={{ background: `linear-gradient(to right, ${maroonColor}, ${maroonLighter})` }} />
                <CardContent className="p-6">
                  <div className="rounded-full p-2 mb-5 inline-block" style={{ backgroundColor: maroonLightest }}>
                    <div style={{ color: maroonColor }}>{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Editor Preview Section */}
      <div className="w-full py-24 bg-gray-50">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="space-y-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{t("advancedEditor")}</h2>
              <p className="text-xl text-gray-500">{t("editorDescription")}</p>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white aspect-[2/1]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A1D2C]/5 to-[#8A3D4C]/5"></div>
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">{t("editorInterface")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
