"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/app/components/ui/button"
import { ChevronDown, LogOut, Settings, HelpCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { useState, useCallback } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Logo } from "./Logo"

interface TopMenuProps {
  user: any
}

export function TopMenu({ user }: TopMenuProps) {
  const [language, setLanguage] = useState("en")
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation("common")
  const router = useRouter()

  const handleLanguageChange = useCallback(
    (lang: string) => {
      setLanguage(lang)
      i18n.changeLanguage(lang)
      setOpen(false)
    },
    [i18n],
  )

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [router])

  const NavLinks = () => {
    if (user) {
      return (
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard">
            <Button variant="ghost">{t("myScore")}</Button>
          </Link>
          <Link href="/community">
            <Button variant="ghost">{t("community")}</Button>
          </Link>
        </div>
      )
    }

    return (
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
    )
  }

  return (
    <div className="relative z-10">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 border-b border-gray-100 bg-white">
        <nav className="flex flex-1 items-center gap-12">
          <Logo
            href={user ? "/dashboard" : "/"}
            size="md"
            withText={true}
            variant="primary"
            borderRadius="rounded-xl"
          />
          <NavLinks />
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#4A1D2C] text-white flex items-center justify-center">
                    {user?.displayName ? user.displayName.charAt(0) : "U"}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2 border-b">
                  <div className="font-medium">{user?.displayName || "User"}</div>
                  <div className="text-sm text-gray-500">View profile</div>
                </div>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Account settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">{t("login")}</Button>
              </Link>
              <Link href="/signup">
                <Button>{t("getStarted")}</Button>
              </Link>
            </>
          )}
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
    </div>
  )
}
