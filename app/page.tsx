'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/_app/components/Footer'
import Main from '@/app/components/Main'
import { TopMenu } from '@/app/components/TopMenu'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const [language, setLanguage] = useState('en')
  const [user, setUser] = useState<any>(null)
  const { t } = useTranslation()

  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen bg-white flex flex-col">
        <TopMenu user={user} />
        <Main />
        <Footer />
      </div>
    </I18nextProvider>
  )
}