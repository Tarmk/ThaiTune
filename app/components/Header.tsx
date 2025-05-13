"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Logo } from "./Logo"

export default function Header() {
  const [language, setLanguage] = useState("en")
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation("common")

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    setOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 border-b border-gray-100 bg-white">
      <nav className="flex flex-1 items-center gap-12">
        <Logo href="/" size="md" withText={true} variant="primary" borderRadius="rounded-xl" />
        <div className="hidden md:flex items-center gap-8">
          <Button variant="ghost" className="flex items-center gap-1.5">
            {t("features")}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
          <Link href="/community">
            <Button variant="ghost">{t("community")}</Button>
          </Link>
          <Button variant="ghost" className="flex items-center gap-1.5">
            {t("ourProducts")}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>
      </nav>
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost">{t("login")}</Button>
        </Link>
        <Link href="/signup">
          <Button variant="default">{t("getStarted")}</Button>
        </Link>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-10 px-0" aria-label="Change language">
              {language === "en" ? "🇺🇸" : "🇹🇭"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-2">
              <button
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                  language === "en" ? "text-[#800000]" : "text-gray-600"
                }`}
                onClick={() => handleLanguageChange("en")}
              >
                🇺🇸 English
              </button>
              <button
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                  language === "th" ? "text-[#800000]" : "text-gray-600"
                }`}
                onClick={() => handleLanguageChange("th")}
              >
                🇹🇭 ไทย
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
