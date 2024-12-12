'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from 'lucide-react'
import Footer from './components/Footer'

const Button = ({ 
  children, 
  className = "", 
  variant = "default", 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'ghost' 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  const variantStyles = {
    default: "bg-[#4A1D2C] text-white hover:bg-[#3A1622] px-4 py-2",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
  }
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 border-b border-gray-100 bg-white">
        <nav className="flex flex-1 items-center gap-12">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#4A1D2C] p-1.5 w-9 h-9 flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202567-11-20%20at%2008.30.37-mljPNNQJsQS2B2AQGZE6ZAddGGGhuQ.png"
                  alt="TMDB Logo"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
              </div>
              <span className="text-lg font-bold text-gray-900">TMDB</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Button variant="ghost" className="flex items-center gap-1.5">
              Features
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
            <Button variant="ghost">Tutorials</Button>
            <Button variant="ghost">Community</Button>
            <Button variant="ghost" className="flex items-center gap-1.5">
              Our Products
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </div>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started for free</Button>
          </Link>
          <Button variant="ghost" className="w-10 px-0" aria-label="Change language">
            🇺🇸
          </Button>
        </div>
      </header>
      <main className="flex-1 pt-16">
        <section className="w-full py-20">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <h1 className="text-5xl font-bold tracking-tight text-gray-900 lg:text-6xl/none">
                    Learn Traditional Thai Music
                  </h1>
                  <p className="text-xl text-gray-500 max-w-[600px]">
                    TMDB is a program that allows users to contribute their knowledge of Traditional Thai Melodies by adding songs they know, while also providing an opportunity to discover and learn new melodies from the existing database.
                  </p>
                </div>
                <div>
                  <Link href="/signup">
                    <Button className="text-base px-6 py-3">
                      Get started for free
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-[4/3]">
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Placeholder Image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-gray-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="space-y-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Widen your Thai Music Repertoire
                </h2>
                <p className="mt-4 text-xl text-gray-500">
                  TMDB allows you to upload your favorite Thai Traditional Songs, whilst accessing other songs uploaded by users.
                </p>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-100 aspect-[2/1] flex items-center justify-center">
                <span className="text-gray-400">Music Score Editor Interface</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}