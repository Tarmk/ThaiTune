"use client"

import * as React from "react"
import { Search, MoreVertical } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import type { Timestamp } from "firebase/firestore"
import { TopMenu } from "@/app/components/TopMenu"
import { SortableTable } from "@/app/components/SortableTable"
import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { useCallback, useState } from "react"
import debounce from "lodash.debounce"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"

interface CommunityScore {
  id: string
  name: string
  author: string
  modified: string
  sharing: string
}

export default function CommunityPage() {
  const { t } = useTranslation("community")
  const [scores, setScores] = useState<CommunityScore[]>([])
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filteredScores, setFilteredScores] = useState<CommunityScore[]>([])
  const router = useRouter()

  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      filterScores(query)
    }, 300),
    [scores],
  )

  const filterScores = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredScores(scores)
        return
      }

      const filtered = scores.filter(
        (score) =>
          score.name.toLowerCase().includes(query.toLowerCase()) ||
          score.author.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredScores(filtered)
    },
    [scores],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchQuery(e.target.value)
  }

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  React.useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true)
        const scoresCollection = collection(db, "scores")
        const scoresSnapshot = await getDocs(scoresCollection)
        const scoresList = scoresSnapshot.docs
          .map((doc) => {
            const data = doc.data()
            const timestamp = data.modified as Timestamp
            return {
              id: doc.id,
              name: data.name,
              author: data.author,
              modified: timestamp?.toDate().toLocaleDateString() || t("unknownDate"),
              sharing: data.sharing,
            }
          })
          .filter((score) => score.sharing === "public")

        setScores(scoresList)
        setFilteredScores(scoresList)
      } catch (error) {
        console.error("Error fetching scores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScores()
  }, [t])

  const columns = [
    {
      key: "name" as keyof CommunityScore,
      label: t("scoreName"),
      render: (score: CommunityScore) => (
        <Link href={`/score/${score.id}`} className="hover:text-[#800000]">
          {score.name}
        </Link>
      ),
    },
    { key: "author" as keyof CommunityScore, label: t("author") },
    { key: "modified" as keyof CommunityScore, label: t("modified") },
  ]

  const renderActions = (score: CommunityScore) => (
    <Button variant="ghost" className="p-1">
      <MoreVertical className="h-5 w-5 text-[#666666]" />
    </Button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenu user={user} />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#333333]">{t("communityScores")}</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 w-64"
              />
            </div>
          </div>
        </div>
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="py-8 text-center">
                <LoadingSpinner />
                <p className="mt-2 text-gray-500">{t("loading")}</p>
              </div>
            ) : (
              <SortableTable
                data={filteredScores}
                columns={columns}
                initialSortColumn="name"
                emptyMessage={t("noScores")}
                actions={renderActions}
                onRowClick={(score) => router.push(`/score/${score.id}`)}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
