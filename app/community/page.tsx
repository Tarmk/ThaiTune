"use client"

import * as React from "react"
import { MoreVertical, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import Link from "next/link"
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { TopMenu } from "@/app/components/TopMenu"
import { useCallback, useMemo } from 'react'
import debounce from 'lodash.debounce'

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

  const debouncedSetSearchQuery = useCallback(
    debounce((query) => setSearchQuery(query), 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchQuery(e.target.value);
  };

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

  const filteredScores = useMemo(() => {
    return scores.filter(score => 
      score.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [scores, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenu user={user} />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#333333]">Community Scores</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Scores"
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 w-64"
              />
            </div>
          </div>
        </div>
        <Card className="bg-white shadow-md">
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 font-medium text-[#333333]">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('name')}>
                      Score Name
                      <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-[#333333]">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('author')}>
                      Author
                      <SortIcon column="author" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-[#333333]">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('modified')}>
                      Modified
                      <SortIcon column="modified" />
                    </button>
                  </th>
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