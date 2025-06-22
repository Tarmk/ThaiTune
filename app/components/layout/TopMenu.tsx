"use client"

import Link from "next/link"
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ChevronDown, LogOut, User, Settings, HelpCircle, Lock, Menu } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from "next/navigation"
import { Logo } from "../common/Logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NoSSR } from "../common/NoSSR"
import { ThemeToggle } from "@/app/components/ui/theme-toggle"
import { LanguageToggle } from "@/app/components/ui/language-toggle"
import { useTheme } from "next-themes"
import { useAuth } from "@/app/providers/auth-provider"

interface TopMenuProps {
  user?: any; // Make user optional as we'll primarily use the auth context
}

export function TopMenu({ user: propUser }: TopMenuProps) {
  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"
  const maroonDark = "#8A3D4C"
  
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation('common')
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user: contextUser, loading } = useAuth()
  
  // Use context user if available, otherwise fall back to prop user
  const user = contextUser || propUser

  // After hydration, we can safely show theme-aware components
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Preload translations for common navigation items
  const translatedStrings = {
    myScore: t('myScore'),
    community: t('community'),
    features: t('features'),
    ourProducts: t('ourProducts'),
    login: t('login'),
    getStarted: t('getStarted'),
    settings: t('settings'),
    logout: t('logout')
  }

  return (
    <div className="relative z-10">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 bg-white dark:bg-[#1a1f2c] shadow-sm dark:shadow-none border-b border-transparent dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Logo 
              size="lg" 
              withText={true} 
              variant="primary" 
              borderRadius="rounded-lg" 
              scale={1.3}
              href={user ? "/dashboard" : "/"} 
            />
            
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <NoSSR>
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors dark:text-gray-200 dark:hover:text-white">
                        {translatedStrings.myScore}
                      </Button>
                    </Link>
                    <Link href="/community">
                      <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors dark:text-gray-200 dark:hover:text-white">
                        {translatedStrings.community}
                      </Button>
                    </Link>
                  </>
                </NoSSR>
              ) : (
                <NoSSR>
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors dark:text-gray-200 dark:hover:text-white flex items-center gap-1.5">
                          {translatedStrings.features}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2 dark:bg-[#232838] dark:border-gray-700">
                        <div className="space-y-1">
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                            Database
                          </Link>
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                            Editor
                          </Link>
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                            Learning Resources
                          </Link>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Link href="/community">
                      <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors dark:text-gray-200 dark:hover:text-white">
                        {translatedStrings.community}
                      </Button>
                    </Link>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors dark:text-gray-200 dark:hover:text-white flex items-center gap-1.5">
                          {translatedStrings.ourProducts}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2 dark:bg-[#232838] dark:border-gray-700">
                        <div className="space-y-1">
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                            ThaiTune Database
                          </Link>
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200">
                            ThaiTune for Education
                          </Link>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                </NoSSR>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NoSSR>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div 
                        className="h-8 w-8 rounded-full text-white flex items-center justify-center"
                        style={{ backgroundColor: theme === 'dark' ? maroonDark : maroonColor }}
                      >
                        {user?.displayName ? user.displayName.charAt(0) : 'U'}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1 shadow-md dark:bg-[#232838] dark:border-gray-700">
                    <div className="px-4 py-3 border-b dark:border-gray-700">
                      <div className="font-medium dark:text-white">{user?.displayName || 'User'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">View profile</div>
                    </div>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md" onClick={() => router.push('/settings')}>
                      <Settings className="h-4 w-4" />
                      <span>Account settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md">
                      <HelpCircle className="h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login">
                    <Button 
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors dark:text-gray-200 dark:hover:text-white"
                    >
                      {translatedStrings.login}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      className="shadow-sm font-medium transition-transform hover:scale-105 bg-[#4A1D2C] hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-[#6A2D3C] text-white"
                    >
                      {translatedStrings.getStarted}
                    </Button>
                  </Link>
                </div>
              )}
              
              <ThemeToggle />
              <LanguageToggle />
            </NoSSR>
            
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" className="p-2" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px] dark:bg-[#232838] dark:border-[#1a1f2c]">
                <div className="mb-8 mt-4">
                  <Logo 
                    size="lg" 
                    withText={true} 
                    variant="primary" 
                    borderRadius="rounded-lg" 
                    scale={1.3}
                    href={user ? "/dashboard" : "/"} 
                  />
                </div>
                <NoSSR>
                  <nav className="flex flex-col gap-4">
                    {!user && (
                      <>
                        <Link href="/login">
                          <Button variant="ghost" className="w-full justify-start text-lg dark:text-gray-200">
                            {translatedStrings.login}
                          </Button>
                        </Link>
                        <Link href="/signup" className="mb-2">
                          <Button 
                            className="w-full text-lg bg-[#4A1D2C] hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-[#6A2D3C] text-white transition-colors"
                          >
                            {translatedStrings.getStarted}
                          </Button>
                        </Link>
                      </>
                    )}
                    <Link href={user ? "/dashboard" : "/"}>
                      <Button variant="ghost" className="w-full justify-start text-lg dark:text-gray-200">
                        {user ? translatedStrings.myScore : translatedStrings.features}
                      </Button>
                    </Link>
                    <Link href="/community">
                      <Button variant="ghost" className="w-full justify-start text-lg dark:text-gray-200">
                        {translatedStrings.community}
                      </Button>
                    </Link>
                    {!user && (
                      <Button variant="ghost" className="w-full justify-start text-lg dark:text-gray-200">
                        {translatedStrings.ourProducts}
                      </Button>
                    )}
                    {user && (
                      <>
                        <div className="flex items-center gap-3 px-3 py-4 border-b dark:border-gray-700 mb-2">
                          <div 
                            className="h-10 w-10 rounded-full text-white flex items-center justify-center text-lg"
                            style={{ backgroundColor: theme === 'dark' ? maroonDark : maroonColor }}
                          >
                            {user?.displayName ? user.displayName.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="font-medium dark:text-white">{user?.displayName || 'User'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Account</div>
                          </div>
                        </div>
                        <Link href="/settings">
                          <Button variant="ghost" className="w-full justify-start text-lg dark:text-gray-200">
                            {translatedStrings.settings}
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-lg text-red-600 dark:text-red-400"
                          onClick={handleLogout}
                        >
                          {translatedStrings.logout}
                        </Button>
                      </>
                    )}
                  </nav>
                </NoSSR>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  )
}