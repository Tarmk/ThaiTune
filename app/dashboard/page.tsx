"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, User, MoreVertical, ChevronUp } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import Link from "next/link"
import { auth, db } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { ProtectedRoute } from '@/app/components/protectedroute'
import { collection, query, where, getDocs } from 'firebase/firestore'

interface Score {
  name: string;
  modified: string;
  sharing: string;
}

export default function Dashboard() {
  const [scores, setScores] = React.useState<Score[]>([]);

  const [sortColumn, setSortColumn] = React.useState<keyof Score | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [user, setUser] = React.useState<any>(null)
  const router = useRouter()

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  React.useEffect(() => {
    const fetchUserScores = async () => {
      if (user?.uid) {
        const q = query(
          collection(db, "scores"),
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const userScores = querySnapshot.docs.map(doc => ({
          name: doc.data().name,
          modified: new Date(doc.data().modified.toDate()).toLocaleDateString(),
          sharing: doc.data().sharing || "Only me"
        }));
        
        setScores(userScores);
      }
    };

    fetchUserScores();
  }, [user]);

  const handleSort = (column: keyof Score) => {
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

  const SortIcon = ({ column }: { column: keyof Score }) => {
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">Scores</h1>
            <Link href="/new-score">
              <Button className="bg-[#800000] text-white hover:bg-[#600000]">
                New score
              </Button>
            </Link>
          </div>
          <Card className="bg-white shadow-md">
            <CardContent>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    {(["name", "modified", "sharing"] as const).map((column) => (
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
                  {scores.map((score, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3 text-[#333333]">{score.name}</td>
                      <td className="py-3 text-[#666666]">{score.modified}</td>
                      <td className="py-3 text-[#666666]">{score.sharing}</td>
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
    </ProtectedRoute>
  )
}