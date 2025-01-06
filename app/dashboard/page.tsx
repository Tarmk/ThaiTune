"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, User, MoreVertical, ChevronUp } from 'lucide-react'
import { Button } from "@/_app/components/ui/button"
import { Card, CardContent } from "@/_app/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/_app/components/ui/popover"
import Link from "next/link"
import { auth, db } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { ProtectedRoute } from '@/app/components/protectedroute'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { TopMenu } from '@/app/components/TopMenu'

interface Score {
  name: string;
  modified: string;
  sharing: string;
  score_id: string;
}

export default function Dashboard() {
  const { t } = useTranslation(['dashboard'])
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
          sharing: doc.data().sharing || "Only me",
          score_id: doc.id
        }));
        console.log("User Score:")
        console.log(userScores);
        
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
      <div className="min-h-screen bg-gray-50">
        <TopMenu user={user} />
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#333333]">{t('dashboard:myScores')}</h1>
   
            <Link href="/new-score" className="inline-block">
              <Button className="bg-[#800000] text-white hover:bg-[#600000]">
                {t('dashboard:newScore')}
              </Button>
            </Link>
          </div>
          <Card className="bg-white shadow-md">
            <CardContent>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 font-medium text-[#333333]">
                      <button className="flex items-center focus:outline-none" onClick={() => handleSort('name')}>
                        {t('dashboard:scoreName')}
                        <SortIcon column="name" />
                      </button>
                    </th>
                    <th className="py-2 font-medium text-[#333333]">
                      <button className="flex items-center focus:outline-none" onClick={() => handleSort('modified')}>
                        {t('dashboard:modified')}
                        <SortIcon column="modified" />
                      </button>
                    </th>
                    <th className="py-2 font-medium text-[#333333]">
                      <button className="flex items-center focus:outline-none" onClick={() => handleSort('sharing')}>
                        {t('dashboard:sharing')}
                        <SortIcon column="sharing" />
                      </button>
                    </th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.score_id} className="border-b last:border-b-0">
                      <td className="py-3 text-[#333333]">
                        <Link href={`/score/${score.score_id}`}>
                          {score.name}
                        </Link>
                      </td>
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