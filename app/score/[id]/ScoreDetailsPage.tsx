"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, User, ArrowLeft } from 'lucide-react'
import { Button } from "@/_app/components/ui/button"
import { Card, CardContent } from "@/_app/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/_app/components/ui/popover"
import Link from "next/link"
import { auth, db } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface Score {
  id: string;
  name: string;
  author: string;
  modified: Date;
  flatid: string;
  userId: string;
  sharing: string;
}

interface ScoreDetailsPageProps {
  id: string;
}

export default function ScoreDetailsPage({ id }: ScoreDetailsPageProps) {
  const [user, setUser] = React.useState<any>(null)
  const [score, setScore] = React.useState<Score | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [authChecked, setAuthChecked] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setAuthChecked(true)
    })

    return () => unsubscribe()
  }, [])

  React.useEffect(() => {
    if (!authChecked) return

    const fetchScore = async () => {
      setLoading(true)
      setError(null)
      try {
        const scoreDoc = await getDoc(doc(db, 'scores', id))
        if (scoreDoc.exists()) {
          const scoreData = scoreDoc.data()
          
          console.log('Score sharing:', scoreData.sharing)
          console.log('Current user:', user?.uid)
          console.log('Score user:', scoreData.userId)
          
          if (scoreData.sharing === 'private' && (!user || user.uid !== scoreData.userId)) {
            setError('This score is private')
            setLoading(false)
            return
          }

          setScore({
            id: scoreDoc.id,
            name: scoreData.name,
            author: scoreData.author,
            modified: scoreData.modified.toDate(),
            flatid: scoreData.flatid,
            userId: scoreData.userId,
            sharing: scoreData.sharing
          })
        } else {
          setError('Score not found')
        }
      } catch (err) {
        console.error('Error fetching score:', err)
        setError('An error occurred while fetching the score')
      } finally {
        setLoading(false)
      }
    }

    fetchScore()
  }, [id, user, authChecked])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleEdit = () => {
    router.push(`/score/${id}/edit`);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  if (!score) {
    return <div className="min-h-screen flex items-center justify-center">Score not found</div>
  }

  const isOwner = user?.uid === score.userId;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href={user ? "/dashboard" : "/"}>
              <img src="/tmdb-logo.png" alt="TMDB Logo" className="h-10" />
            </Link>
            <nav className="flex space-x-6">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-[#333333] hover:text-[#800000] font-medium">My scores</Link>
                  <Link href="/community" className="text-[#333333] hover:text-[#800000] font-medium">Community</Link>
                  <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Browse & Explore</Link>
                  <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Learn</Link>
                </>
              ) : (
                <>
                  <Link href="/community" className="text-[#333333] hover:text-[#800000] font-medium">Community</Link>
                  <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Browse & Explore</Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
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
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#800000] text-white hover:bg-[#600000]">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-[#800000] hover:underline"
          >
            <ArrowLeft className="mr-2" />
            Back
          </button>
        </div>
        <h1 className="text-2xl font-bold text-[#333333] mb-4">{score.name}</h1>
        <p className="text-lg text-[#666666] mb-6">By {score.author}</p>
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <iframe
              src={`https://flat.io/embed/${score.flatid}?themePrimary=%23800000&branding=false&appId=6755790be2eebcce112acde7`}
              height="450"
              width="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; midi"
            ></iframe>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-[#666666]">Last modified: {score.modified.toLocaleString()}</p>
          {isOwner && (
            <button onClick={handleEdit} className="text-[#333333] hover:text-[#800000] font-medium">
              Edit
            </button>
          )}
        </div>
      </main>
    </div>
  )
}