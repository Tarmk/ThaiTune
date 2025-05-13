"use client"

import Link from "next/link"
import { useTranslation } from 'react-i18next'
import { Button } from '../Button'
import { ChevronDown, LogOut, User, Settings, HelpCircle, Lock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from "next/navigation"
import { Logo } from "../common/Logo"

interface TopMenuProps {
  user: any;
}

export function TopMenu({ user }: TopMenuProps) {
  const [language, setLanguage] = useState('en')
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation('common')
  const router = useRouter()

  console.log('User object:', user)

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    setOpen(false)
  }

  const handleLogout = async () => {
    try {
      console.log('Logging out...')
      await signOut(auth)
      console.log('Logged out, redirecting...')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="relative z-10">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 border-b border-gray-100 bg-white">
      
        <nav className="flex flex-1 items-center gap-12">
          <Logo 
            size="lg" 
            withText={true} 
            variant="primary" 
            borderRadius="rounded-lg" 
            scale={1.3}
            href={user ? "/dashboard" : "/"} 
          />
          {user ? (
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard">
                <Button variant="ghost">{t('myScore')}</Button>
              </Link>
              <Link href="/community">
                <Button variant="ghost">{t('community')}</Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-8">
              <Button variant="ghost" className="flex items-center gap-1.5">
                {t('features')}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
              <Link href="/community">
                <Button variant="ghost">{t('community')}</Button>
              </Link>
              <Button variant="ghost" className="flex items-center gap-1.5">
                {t('ourProducts')}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </div>
          )}
        </nav>
        <div className="flex items-center gap-3">
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#4A1D2C] text-white flex items-center justify-center">
                    {user?.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2 border-b">
                  <div className="font-medium">{user?.displayName || 'User'}</div>
                  <div className="text-sm text-gray-500">View profile</div>
                </div>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/settings')}>
                  <Settings className="h-4 w-4" />
                  <span>Account settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer"
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
                <Button variant="ghost">{t('login')}</Button>
              </Link>
              <Link href="/signup">
                <Button>{t('getStarted')}</Button>
              </Link>
            </>
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
        </div>
      </header>
    </div>
  )
}