"use client"

import * as React from "react"
import { MoreVertical, ChevronUp, ChevronDown, Star, Bookmark, Trash2, Pencil, EyeOff, Flag } from 'lucide-react'
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import Link from "next/link"
import { auth, db } from '@/lib/firebase'
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { TopMenu } from "@/app/components/layout/TopMenu"
import { useCallback, useMemo } from 'react'
import debounce from 'lodash.debounce'
import { useTranslation } from 'react-i18next'
import { useTheme } from "next-themes"
import { SearchBar } from "@/app/components/common/SearchBar"
import Footer from "../components/layout/Footer"
import { useRouter } from "next/navigation"
import { Popover, PopoverTrigger, PopoverContent } from "@/app/components/ui/popover"
import { onAuthStateChanged, User } from "firebase/auth"

interface CommunityScore {
  id: string;
  name: string;
  author: string;
  modified: string;
  created: string;
  sharing: string;
  rating: number;
  ratingCount: number;
  userId: string;
  isBookmarked: boolean;
}

interface BookmarkData {
  id: string;
  scoreId: string;
}

export default function CommunityPage() {
  const { t } = useTranslation('community')
  const [scores, setScores] = React.useState<CommunityScore[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sortColumn, setSortColumn] = React.useState<keyof CommunityScore | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = React.useState("")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()

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

  const fetchBookmarkedScores = async (userId: string) => {
    const bookmarksRef = collection(db, 'bookmarks');
    const bookmarksQuery = query(bookmarksRef, where('userId', '==', userId));
    const bookmarksSnapshot = await getDocs(bookmarksQuery);
    return bookmarksSnapshot.docs.map(doc => ({
      id: doc.id,
      scoreId: doc.data().scoreId as string
    }));
  };

  React.useEffect(() => {
    // Listen for auth changes so we know if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (u) => setCurrentUser(u))

    const fetchScores = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        const scoresCollection = collection(db, 'scores')
        const scoresSnapshot = await getDocs(scoresCollection)
        
        let bookmarkedScoreIds: string[] = [];
        if (user) {
          const bookmarks = await fetchBookmarkedScores(user.uid);
          bookmarkedScoreIds = bookmarks.map(bookmark => bookmark.scoreId);
        }
        
        const scoresList = scoresSnapshot.docs
          .map(doc => {
            const data = doc.data()
            const modifiedTimestamp = data.modified as Timestamp
            const createdTimestamp = data.created as Timestamp
            return {
              id: doc.id,
              name: data.name || '',
              author: data.author || '',
              modified: modifiedTimestamp?.toDate().toLocaleString() || t('unknownDate'),
              created: createdTimestamp?.toDate().toLocaleString() || t('unknownDate'),
              sharing: data.sharing || 'private',
              rating: data.rating || 0,
              ratingCount: data.ratingCount || 0,
              userId: data.userId || '',
              isBookmarked: bookmarkedScoreIds.includes(doc.id)
            }
          })
          .filter(score => score.sharing === 'public')
        setScores(scoresList)
      } catch (error) {
        console.error('Error fetching scores:', error)
      } finally {
        setLoading(false);
      }
    }

    fetchScores()

    return () => unsubscribe()
  }, [t])

  const handleBookmark = async (scoreId: string, isCurrentlyBookmarked: boolean) => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const bookmarksRef = collection(db, 'bookmarks');
        const bookmarkQuery = query(
          bookmarksRef,
          where('userId', '==', user.uid),
          where('scoreId', '==', scoreId)
        );
        const bookmarkSnapshot = await getDocs(bookmarkQuery);
        
        if (!bookmarkSnapshot.empty) {
          await deleteDoc(doc(db, 'bookmarks', bookmarkSnapshot.docs[0].id));
        }
      } else {
        // Add bookmark
        const bookmarksRef = collection(db, 'bookmarks');
        await addDoc(bookmarksRef, {
          userId: user.uid,
          scoreId: scoreId,
          createdAt: new Date()
        });
      }

      // Update local state
      setScores(prevScores =>
        prevScores.map(score =>
          score.id === scoreId
            ? { ...score, isBookmarked: !isCurrentlyBookmarked }
            : score
        )
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

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

  const handleDeleteScore = async (scoreId: string) => {
    if (!currentUser) return
    const confirmed = window.confirm("Delete this score? This action cannot be undone.")
    if (!confirmed) return
    try {
      await deleteDoc(doc(db, "scores", scoreId))
      setScores(prev => prev.filter(s => s.id !== scoreId))
    } catch (error) {
      console.error("Error deleting score:", error)
    }
  }

  const handleRenameScore = async (scoreId: string, oldName: string) => {
    const newName = window.prompt("Enter new score name", oldName)
    if (!newName || newName.trim() === oldName) return
    try {
      await updateDoc(doc(db, "scores", scoreId), { name: newName.trim() })
      setScores(prev => prev.map(s => s.id === scoreId ? { ...s, name: newName.trim() } : s))
    } catch (error) {
      console.error("Error renaming score:", error)
    }
  }

  const handleToggleSharing = async (scoreId: string, currentSharing: string) => {
    const newSharing = currentSharing === "public" ? "private" : "public"
    try {
      await updateDoc(doc(db, "scores", scoreId), { sharing: newSharing })
      if (newSharing === "private") {
        // Remove from community list when made private
        setScores(prev => prev.filter(s => s.id !== scoreId))
      } else {
        setScores(prev => prev.map(s => s.id === scoreId ? { ...s, sharing: newSharing } : s))
      }
    } catch (error) {
      console.error("Error updating sharing:", error)
    }
  }

  const handleHideScore = (scoreId: string) => {
    // Simple local hide – store in localStorage
    const hidden = JSON.parse(localStorage.getItem("hiddenScores") || "[]") as string[]
    if (!hidden.includes(scoreId)) {
      hidden.push(scoreId)
      localStorage.setItem("hiddenScores", JSON.stringify(hidden))
    }
    setScores(prev => prev.filter(s => s.id !== scoreId))
  }

  const handleReportScore = async (scoreId: string) => {
    try {
      await addDoc(collection(db, "scoreReports"), {
        scoreId,
        reportedAt: new Date(),
        reporterId: currentUser?.uid || "anonymous"
      })
      alert("Score reported. Thank you for helping keep the community safe.")
    } catch (error) {
      console.error("Error reporting score:", error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c] transition-colors duration-300" style={{ background: pageBg }}>
      <TopMenu />
      <main className="flex-grow max-w-7xl mx-auto px-4 pt-20 pb-6 w-full">
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
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b last:border-b-0 dark:border-gray-700">
                      <td className="py-3">
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500 dark:text-gray-400">
                      {t('noScores')}
                    </td>
                  </tr>
                ) : (
                  filteredScores.map(score => (
                    <tr key={score.id} className="border-b last:border-b-0 dark:border-gray-700">
                      <td className="py-3 text-[#333333] dark:text-white">
                        <Link href={`/score/${score.id}`} className="hover:text-[#800000] dark:hover:text-[#e5a3b4]">
                          {score.name}
                        </Link>
                      </td>
                      <td className="py-3 text-[#666666] dark:text-gray-300">
                        <Link href={`/user/${score.userId}`} className="hover:underline">
                          {score.author}
                        </Link>
                      </td>
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
                      <td className="py-3 flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          className="p-1"
                          onClick={() => handleBookmark(score.id, score.isBookmarked || false)}
                        >
                          <Bookmark
                            className={`h-5 w-5 ${
                              score.isBookmarked
                                ? 'fill-current text-[#800000] dark:text-[#e5a3b4]'
                                : 'text-[#666666] dark:text-gray-400'
                            }`}
                          />
                        </Button>
                        {currentUser && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" className="p-1">
                                <MoreVertical className="h-5 w-5 text-[#666666] dark:text-gray-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2 bg-white dark:bg-[#232838] dark:border-gray-700">
                              {currentUser.uid === score.userId ? (
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm text-red-600 dark:text-red-400"
                                    onClick={() => handleDeleteScore(score.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm"
                                    onClick={() => handleRenameScore(score.id, score.name)}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" /> Rename
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm"
                                    onClick={() => handleToggleSharing(score.id, score.sharing)}
                                  >
                                    <EyeOff className="h-4 w-4 mr-2" /> {score.sharing === 'public' ? 'Make Private' : 'Make Public'}
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm"
                                    onClick={() => handleHideScore(score.id)}
                                  >
                                    <EyeOff className="h-4 w-4 mr-2" /> Hide Score
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm text-red-600 dark:text-red-400"
                                    onClick={() => handleReportScore(score.id)}
                                  >
                                    <Flag className="h-4 w-4 mr-2" /> Report Score
                                  </Button>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}