"use client"

import * as React from "react"
import { MoreVertical, ChevronUp, ChevronDown, Star } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import Link from "next/link"
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { TopMenu } from "@/app/components/layout/TopMenu"
import { useCallback, useMemo } from 'react'
import debounce from 'lodash.debounce'
import { useTranslation } from 'react-i18next'
import { useTheme } from "next-themes"
import { SearchBar } from "@/app/components/common/SearchBar"

interface CommunityScore {
  id: string;
  name: string;
  author: string;
  modified: string;
  created: string;
  sharing: string;
  rating?: number;
  ratingCount?: number;
}

export default function CommunityPage() {
  const { t } = useTranslation('community')
  const [scores, setScores] = React.useState<CommunityScore[]>([]);
  const [sortColumn, setSortColumn] = React.useState<keyof CommunityScore | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = React.useState("")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware colors
  const maroonColor = "#800000"
  const maroonDark = "#e5a3b4"
  const accentColor = mounted && resolvedTheme === "dark" ? maroonDark : maroonColor
  
  // Background colors matching the landing page
  const pageBg = mounted && resolvedTheme === "dark" ? "#1a1f2c" : "#f3f4f6" 
  const cardBg = mounted && resolvedTheme === "dark" ? "#242A38" : "white"
  const inputBg = mounted && resolvedTheme === "dark" ? "#212838" : "#f9fafb"
  const inputBorder = mounted && resolvedTheme === "dark" ? "#323A4B" : "#e5e7eb"
  const textColor = mounted && resolvedTheme === 'dark' ? 'white' : '#111827'

  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  const handleSearchChange = (value: string) => {
    debouncedSetSearchQuery(value);
  };

  React.useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoresCollection = collection(db, 'scores')
        const scoresSnapshot = await getDocs(scoresCollection)
        const scoresList = scoresSnapshot.docs
          .map(doc => {
            const data = doc.data()
            const modifiedTimestamp = data.modified as Timestamp
            const createdTimestamp = data.created as Timestamp
            return {
              id: doc.id,
              name: data.name,
              author: data.author,
              modified: modifiedTimestamp?.toDate().toLocaleString() || t('unknownDate'),
              created: createdTimestamp?.toDate().toLocaleString() || t('unknownDate'),
              sharing: data.sharing,
              rating: data.rating || 0,
              ratingCount: data.ratingCount || 0
            }
          })
          .filter(score => score.sharing === 'public')
        setScores(scoresList)
      } catch (error) {
        console.error('Error fetching scores:', error)
      }
    }

    fetchScores()
  }, [t])

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
      <ChevronUp className="ml-1 h-4 w-4" style={{ color: accentColor }} /> : 
      <ChevronDown className="ml-1 h-4 w-4" style={{ color: accentColor }} />
  }

  const filteredScores = useMemo(() => {
    return scores.filter(score => 
      score.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [scores, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1f2c] transition-colors duration-300" style={{ background: pageBg }}>
      <TopMenu />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#333333] dark:text-white">{t('communityScores')}</h1>
          <div className="flex items-center space-x-4">
            <SearchBar 
              placeholder={t('searchPlaceholder')}
              onChange={handleSearchChange}
              className="w-64"
            />
          </div>
        </div>
        <Card className="bg-white shadow-md transition-colors duration-300" style={{ background: cardBg }}>
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="py-2 font-medium text-[#333333] dark:text-white">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('name')}>
                      {t('scoreName')}
                      <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-[#333333] dark:text-white">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('author')}>
                      {t('author')}
                      <SortIcon column="author" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-[#333333] dark:text-white">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('rating')}>
                      {t('rating', { ns: 'dashboard' })}
                      <SortIcon column="rating" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-left text-[#333333] dark:text-white">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('created')}>
                      {t('created', { ns: 'community' })}
                      <SortIcon column="created" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-left text-[#333333] dark:text-white">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('modified')}>
                      {t('modified')}
                      <SortIcon column="modified" />
                    </button>
                  </th>
                  <th className="py-2 dark:text-white">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">
                      {t('noScores')}
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((score) => (
                    <tr key={score.id} className="border-b last:border-b-0 dark:border-gray-700">
                      <td className="py-3 text-[#333333] dark:text-white">
                        <Link href={`/score/${score.id}`} className="hover:text-[#800000] dark:hover:text-[#e5a3b4]">
                          {score.name}
                        </Link>
                      </td>
                      <td className="py-3 text-[#666666] dark:text-gray-300">{score.author}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= score.rating ? 'fill-current text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-[#666666] dark:text-gray-400">
                            {score.rating ? score.rating.toFixed(1) : "0.0"}
                            {score.ratingCount ? ` (${score.ratingCount})` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-[#666666] dark:text-gray-300">{score.created}</td>
                      <td className="py-3 text-[#666666] dark:text-gray-300">{score.modified}</td>
                      <td className="py-3">
                        <Button variant="ghost" className="p-1">
                          <MoreVertical className="h-5 w-5 text-[#666666] dark:text-gray-400" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}