"use client"

import { useState } from "react"
import Footer from "@/app/components/Footer"
import Main from "@/app/components/Main"
import { TopMenu } from "@/app/components/TopMenu"
import { useTranslation } from "react-i18next"

export default function HomePage() {
  const [language, setLanguage] = useState("en")
  const [user, setUser] = useState<any>(null)
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopMenu user={user} />
      <Main />
      <Footer />
    </div>
  )
}
