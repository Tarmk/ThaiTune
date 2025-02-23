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
import { TopMenu } from "@/app/components/TopMenu"

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const embedRef = React.useRef<any>(null);

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

  React.useEffect(() => {
    if (!score || !score.flatid) return;

    const script = document.createElement('script');
    script.src = 'https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js';
    script.async = true;
    script.onload = () => {
      if (!containerRef.current || !window.Flat) return;

      embedRef.current = new window.Flat.Embed(containerRef.current, {
        score: score.flatid,
        embedParams: {
          mode: 'view',
          appId: '675579130b7f5c8a374ac19a',
          branding: false,
          themePrimary: '#800000'
        }
      });
      console.log('embedRef.current')
      console.log(embedRef.current)
      embedRef.current.getPNG({
        result: 'dataURL',
        layout: 'layout',
        dpi: 300,
      })
      .then(function (png) {
        console.log('png')
        // 300 DPI PNG with the score as a page, returned as a DataURL
        console.log(png);
      })
      .catch(function (error) {
        console.error('Error generating PNG:', error);
      });
    };
    document.body.appendChild(script);

    return () => {
      if (embedRef.current) {
        embedRef.current.destroy();
      }
    };
  }, [score]);

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

  const handleAIAssistant = () => {
    // Ensure embedRef is initialized and has the getPNG method
    console.log(embedRef.current)
    if (embedRef.current ) {
      embedRef.current.getPNG({
        result: 'dataURL',
        layout: 'layout',
        dpi: 300,
      })
      .then(function (png) {
        // 300 DPI PNG with the score as a page, returned as a DataURL
        console.log(png);
      })
      .catch(function (error) {
        console.error('Error generating PNG:', error);
      });
    } else {
      console.error('embedRef is not initialized or getPNG method is not available');
    }
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
      <TopMenu user={user} />
      <main className="max-w-7xl mx-auto px-4 py-6 mt-16">
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
            <div ref={containerRef} style={{ height: '450px', width: '100%' }} />
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-[#666666]">Last modified: {score.modified.toLocaleString()}</p>
          {isOwner && (
            <>
              <button onClick={handleEdit} className="text-[#333333] hover:text-[#800000] font-medium">
                Edit
              </button>
            </>
          )}
          <button onClick={handleAIAssistant} className="ml-4 text-[#333333] hover:text-[#800000] font-medium">
            AI Assistant
          </button>
        </div>
      </main>
    </div>
  )
}