"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, User, MoreVertical, ChevronUp, Search } from 'lucide-react'
import { Button } from "@/_app/components/ui/button"
import { Card, CardContent } from "@/_app/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/_app/components/ui/popover"
import { Input } from "@/_app/components/ui/input"
import Link from "next/link"
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'

interface CommunityScore {
  id: string;
  name: string;
  author: string;
  modified: string;
  sharing: string;
}

export default function CommunityPage() {
  const [scores, setScores] = React.useState<CommunityScore[]>([]);

  const [sortColumn, setSortColumn] = React.useState<keyof CommunityScore | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [user, setUser] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const router = useRouter()

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  React.useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoresCollection = collection(db, 'scores')
        const scoresSnapshot = await getDocs(scoresCollection)
        const scoresList = scoresSnapshot.docs
          .map(doc => {
            const data = doc.data()
            const timestamp = data.modified as Timestamp
            return {
              id: doc.id,
              name: data.name,
              author: data.author,
              modified: timestamp?.toDate().toLocaleDateString() || 'Unknown date',
              sharing: data.sharing
            }
          })
          .filter(score => score.sharing === 'public')
        setScores(scoresList)
      } catch (error) {
        console.error('Error fetching scores:', error)
      }
    }

    fetchScores()
  }, [])

  const handleSort = (column: keyof CommunityScore) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }

    const sortedScores = [...scores].sort((a, b) => {
      if (a[column] < b[column]) return sortDirection === 'asc' ? -1 : 1
      if (a[column] > b[column]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setScores(sortedScores)
  }

  const SortIcon = ({ column }: { column: keyof CommunityScore }) => {
    if (sortColumn !== column) return <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4 text-[#800000]" /> : 
      <ChevronDown className="ml-1 h-4 w-4 text-[#800000]" />
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const filteredScores = scores.filter(score => 
    score.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    score.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/">
              <img src="/tmdb-logo.png" alt="TMDB Logo" className="h-10" />
            </Link>
            <nav className="flex space-x-6">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-[#333333] hover:text-[#800000] font-medium">My scores</Link>
                  <Link href="/community" className="text-[#800000] font-medium">Community</Link>
                  <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Browse & Explore</Link>
                  <Link href="#" className="text-[#333333] hover:text-[#800000] font-medium">Learn</Link>
                </>
              ) : (
                <>
                  <Link href="/community" className="text-[#800000] font-medium">Community</Link>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#333333]">Community Scores</h1>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search scores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <Card className="bg-white shadow-md">
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  {(["name", "author", "modified"] as const).map((column) => (
                    <th key={column} className="py-2 font-medium text-[#333333]">
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => handleSort(column)}
                      >
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                        <SortIcon column={column} />
                      </button>
                    </th>
                  ))}
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((score) => (
                  <tr key={score.id} className="border-b last:border-b-0">
                    <td className="py-3 text-[#333333]">
                      <Link href={`/score/${score.id}`} className="hover:text-[#800000]">
                        {score.name}
                      </Link>
                    </td>
                    <td className="py-3 text-[#666666]">{score.author}</td>
                    <td className="py-3 text-[#666666]">{score.modified}</td>
                    <td className="py-3">
                      <Button variant="ghost" className="p-1">
                        <MoreVertical className="h-5 w-5 text-[#666666]" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}