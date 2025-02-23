'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/_app/components/Footer'
import Main from '@/app/components/Main'
import { TopMenu } from '@/app/components/TopMenu'

export default function HomePage() {
  const [language, setLanguage] = useState('en')
  const [user, setUser] = useState<any>(null)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopMenu user={user} />
      <Main />
      <Footer />
    </div>
  )
}