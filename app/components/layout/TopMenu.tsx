"use client"

import Link from "next/link"
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ChevronDown, LogOut, User, Settings, HelpCircle, Lock, Menu } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from 'react'
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

interface TopMenuProps {
  user: any;
}

export function TopMenu({ user }: TopMenuProps) {
  // Theme colors
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"
  
  const [language, setLanguage] = useState('en')
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation('common')
  const router = useRouter()

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    setOpen(false)
  }

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
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 bg-white shadow-sm">
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
                      <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors">
                        {translatedStrings.myScore}
                      </Button>
                    </Link>
                    <Link href="/community">
                      <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors">
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
                        <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors flex items-center gap-1.5">
                          {translatedStrings.features}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2">
                        <div className="space-y-1">
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                            Database
                          </Link>
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                            Editor
                          </Link>
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                            Learning Resources
                          </Link>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Link href="/community">
                      <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors">
                        {translatedStrings.community}
                      </Button>
                    </Link>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors flex items-center gap-1.5">
                          {translatedStrings.ourProducts}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2">
                        <div className="space-y-1">
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100">
                            ThaiTune Database
                          </Link>
                          <Link href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100">
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
                      className="flex items-center gap-2 font-medium hover:bg-gray-100 transition-colors"
                    >
                      <div 
                        className="h-8 w-8 rounded-full text-white flex items-center justify-center"
                        style={{ backgroundColor: maroonColor }}
                      >
                        {user?.displayName ? user.displayName.charAt(0) : 'U'}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1 shadow-md">
                    <div className="px-4 py-3 border-b">
                      <div className="font-medium">{user?.displayName || 'User'}</div>
                      <div className="text-sm text-gray-500">View profile</div>
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
                      className="font-medium text-gray-700 hover:text-[#4A1D2C] transition-colors"
                    >
                      {translatedStrings.login}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      className="shadow-sm font-medium transition-transform hover:scale-105"
                      style={{ backgroundColor: maroonColor }}
                    >
                      {translatedStrings.getStarted}
                    </Button>
                  </Link>
                </div>
              )}
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-center rounded-full w-8 h-8 p-0 border border-[#4A1D2C] hover:bg-[#F8F1F3] hover:text-[#4A1D2C]" 
                    aria-label="Change language"
                  >
                    <span className="text-sm">{language === 'en' ? '🇺🇸' : '🇹🇭'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2 rounded-lg border-[#4A1D2C] shadow-md">
                  <div className="space-y-1">
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        language === 'en' 
                          ? 'bg-[#F8F1F3] text-[#4A1D2C] font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => handleLanguageChange('en')}
                    >
                      <span className="text-base">🇺🇸</span>
                      <span>English</span>
                    </button>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        language === 'th' 
                          ? 'bg-[#F8F1F3] text-[#4A1D2C] font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => handleLanguageChange('th')}
                    >
                      <span className="text-base">🇹🇭</span>
                      <span>ไทย</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </NoSSR>
            
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:w-[350px] py-6">
                <NoSSR>
                  <nav className="flex flex-col gap-4">
                    {!user && (
                      <>
                        <Link href="/login">
                          <Button variant="ghost" className="w-full justify-start text-lg">
                            {translatedStrings.login}
                          </Button>
                        </Link>
                        <Link href="/signup" className="mb-2">
                          <Button className="w-full text-lg" style={{ backgroundColor: maroonColor }}>
                            {translatedStrings.getStarted}
                          </Button>
                        </Link>
                      </>
                    )}
                    <Link href={user ? "/dashboard" : "/"}>
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        {user ? translatedStrings.myScore : translatedStrings.features}
                      </Button>
                    </Link>
                    <Link href="/community">
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        {translatedStrings.community}
                      </Button>
                    </Link>
                    {!user && (
                      <Button variant="ghost" className="w-full justify-start text-lg">
                        {translatedStrings.ourProducts}
                      </Button>
                    )}
                    {user && (
                      <>
                        <Link href="/settings">
                          <Button variant="ghost" className="w-full justify-start text-lg">
                            {translatedStrings.settings}
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-lg text-red-600"
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