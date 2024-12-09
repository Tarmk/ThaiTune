"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, User, ArrowLeft } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import Link from "next/link"
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { ProtectedRoute } from '@/app/components/protectedroute'

export default function ScoreDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, setUser] = React.useState<any>(null)
  const router = useRouter()
  const { id } = React.use(params)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Mock data - replace with actual data fetching logic
  const score = {
    id,
    name: "Moonlight Sonata",
    author: "Ludwig van Beethoven",
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F5F5]">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard">
                <img src="/tmdb-logo.png" alt="TMDB Logo" className="h-10" />
              </Link>
              <nav className="flex space-x-6">
                <Link href="/dashboard" className="text-[#333333] hover:text-[#800000] font-medium">My scores</Link>
                <Link href="/community" className="text-[#333333] hover:text-[#800000] font-medium">Community</Link>
                <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Browse & Explore</Link>
                <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Learn</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="text-[#333333] hover:text-[#800000] cursor-pointer" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="text-[#333333]" />
                    <ChevronDown className="text-[#333333]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-[#800000] flex items-center justify-center text-white">
                      {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
                      <Link href="#" className="text-xs text-[#800000] hover:underline">View profile</Link>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Link href="#" className="block text-sm text-[#333333] hover:text-[#800000]">Account settings</Link>
                    <Link href="#" className="block text-sm text-[#333333] hover:text-[#800000]">Contact us</Link>
                    <Link href="#" className="block text-sm text-[#333333] hover:text-[#800000]">Help</Link>
                    <button onClick={handleLogout} className="block w-full text-left text-sm text-[#333333] hover:text-[#800000]">Logout</button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <Link href="/community" className="flex items-center text-[#800000] hover:underline">
              <ArrowLeft className="mr-2" />
              Back to Community Scores
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-[#333333] mb-4">{score.name}</h1>
          <p className="text-lg text-[#666666] mb-6">By {score.author}</p>
          <div className="bg-white rounded-lg shadow-md p-4">
            <iframe
              src={`https://flat.io/embed/${id}?appId=6755790be2eebcce112acde7`}
              height="450"
              width="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; midi"
            ></iframe>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}