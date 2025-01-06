'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import Header from '@/app/components/Header'
import Footer from '@/_app/components/Footer'
import Main from '@/app/components/Main'
import { TopMenu } from '@/app/components/TopMenu'
export default function HomePage() {
  const [language, setLanguage] = useState('en')
  const { i18n } = useTranslation('common')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language, i18n])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopMenu user={user} />
      <Main />
      <Footer />
    </div>
  )
}