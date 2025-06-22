"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle, X, ZoomIn, ZoomOut, Maximize2, Star } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"
import Link from "next/link"

import { Card, CardContent } from "@/app/components/ui/card"
import { auth, db } from "@/lib/firebase"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { TopMenu } from "@/app/components/layout/TopMenu"
import OpenAI from "openai"
import Footer from "@/app/components/layout/Footer"

interface Score {
  id: string
  name: string
  author: string
  modified: Date
  flatid: string
  userId: string
  sharing: string
  description?: string
  rating?: number
  ratingCount?: number
  userRating?: number
}

interface ScoreDetailsPageProps {
  id: string
}

// Star Rating Component
const StarRating = ({ 
  rating, 
  onRatingChange, 
  userRating, 
  disabled = false 
}: { 
  rating: number
  onRatingChange: (rating: number) => void
  userRating?: number
  disabled?: boolean
}) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const starColor = mounted && resolvedTheme === "dark" ? "#FFD700" : "#FFD700"
  const emptyStarColor = mounted && resolvedTheme === "dark" ? "#4B5563" : "#D1D5DB"

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={`transition-colors duration-200 ${
            disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= (userRating || rating) ? 'fill-current' : ''
            }`}
            style={{ 
              color: star <= (userRating || rating) ? starColor : emptyStarColor 
            }}
          />
        </button>
      ))}
    </div>
  )
}

export default function ScoreDetailsPage({ id }: ScoreDetailsPageProps) {
  const [user, setUser] = React.useState<any>(null)
  const [score, setScore] = React.useState<Score | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [authChecked, setAuthChecked] = React.useState(false)
  const [ratingLoading, setRatingLoading] = React.useState(false)
  const router = useRouter()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const embedRef = React.useRef<any>(null)
  const scriptRef = React.useRef<HTMLScriptElement | null>(null)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [chatMessages, setChatMessages] = React.useState<string[]>([])
  const chatEndRef = React.useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation(["common", "dashboard"])
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [themeKey, setThemeKey] = React.useState(0)
  const [isAutoZoom, setIsAutoZoom] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware colors
  const buttonColor = "hsl(var(--primary))"
  const linkColor = "hsl(var(--primary))"

  const openai = new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY ||
      "sk-svcacct-U1ZLkSvtRFwAzPLrR-XseW0sNZ-rHNf1Mtw5k2s_DNhjj5HxrU_SnVsxlikcjKaT3BlbkFJKFNz4Cza_cDEewCihVQ22wduNQ_JVG6qI-cDZJqgEuWMp0cuAmTn5lY8vdeFYUAA",
    dangerouslyAllowBrowser: true,
  })

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
        const scoreDoc = await getDoc(doc(db, "scores", id))
        if (scoreDoc.exists()) {
          const scoreData = scoreDoc.data()

          console.log("Score sharing:", scoreData.sharing)
          console.log("Current user:", user?.uid)
          console.log("Score user:", scoreData.userId)

          if (scoreData.sharing === "private" && (!user || user.uid !== scoreData.userId)) {
            setError("This score is private")
            setLoading(false)
            return
          }

          // Check if user has already rated this score
          let userRating = 0
          if (user && scoreData.ratings && scoreData.ratings[user.uid]) {
            userRating = scoreData.ratings[user.uid]
          }

          setScore({
            id: scoreDoc.id,
            name: scoreData.name,
            author: scoreData.author,
            modified: scoreData.modified.toDate(),
            flatid: scoreData.flatid,
            userId: scoreData.userId,
            sharing: scoreData.sharing,
            description: scoreData.description || "",
            rating: scoreData.rating || 0,
            ratingCount: scoreData.ratingCount || 0,
            userRating: userRating,
          })
        } else {
          setError("Score not found")
        }
      } catch (err) {
        console.error("Error fetching score:", err)
        setError("An error occurred while fetching the score")
      } finally {
        setLoading(false)
      }
    }

    fetchScore()
  }, [id, user, authChecked])

  React.useEffect(() => {
    if (mounted) {
      setThemeKey(prevKey => prevKey + 1)
    }
  }, [resolvedTheme, mounted])

  const cleanupEmbed = React.useCallback(() => {
    if (embedRef.current) {
      embedRef.current = null
    }
    
    if (scriptRef.current && document.body.contains(scriptRef.current)) {
      document.body.removeChild(scriptRef.current)
      scriptRef.current = null
    }
  }, [])

  React.useEffect(() => {
    console.log("Creating embed with theme:", resolvedTheme)
    console.log("Score:", score)
    
    if (!score || !score.flatid || !mounted) return
    
    cleanupEmbed()

    const script = document.createElement("script")
    script.src = "https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js"
    script.async = true
    scriptRef.current = script
    
    script.onload = () => {
      if (!containerRef.current || !window.Flat) return

      const embedThemeColor = resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C"
      const embedControlsBackground = resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C"
      const embedScoreBackground = resolvedTheme === "dark" ? "transparent" : "transparent"

      embedRef.current = new window.Flat.Embed(containerRef.current, {
        score: score.flatid,
        embedParams: {
          mode: "view",
          appId: "6755790be2eebcce112acde7",
          branding: false,
          themePrimary: embedThemeColor,
          themePrimaryDark: embedThemeColor, 
          themeControlsBackground: embedControlsBackground,
          themeScoreBackground: embedScoreBackground,
          themeCursorV0: embedThemeColor,
          controlsZoom : true,
          
        },
      })
      
      embedRef.current.ready().then(() => {
        console.log("Embed ready with theme:", resolvedTheme)
        embedRef.current
          .getPNG({
            result: "dataURL",
            layout: "track",
            dpi: 300,
          })
          .then((png: string) => {
            console.log("PNG generated on load:", png)
          })
      })
    }
    
    document.body.appendChild(script)

    return () => {
      cleanupEmbed()
    }
  }, [score, mounted, resolvedTheme, themeKey, cleanupEmbed])

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleEdit = () => {
    router.push(`/score/${id}/edit`)
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const extractMusicSheetData = (fullData: any) => {
    return {
      work: {
        title: fullData?.work?.["work-title"]
      },
      partList: fullData?.["part-list"]?.["score-part"]?.map((part: any) => ({
        id: part["$id"],
        name: part["part-name"],
        abbreviation: part["part-abbreviation"],
        instrument: part["score-instrument"]?.["instrument-name"]
      })),
      parts: fullData?.part?.map((part: any) => ({
        id: part["$id"],
        measures: part.measure?.map((measure: any) => ({
          number: measure["$number"],
          attributes: measure.attributes,
          notes: measure.note,
          directions: measure.direction,
          harmony: measure.harmony
        }))
      }))
    };
  };

  const sendMessageToChatGPT = async (message: string) => {
    try {
      let pngData = null
      let xmlString = null
      let extractedData = null
      if (embedRef.current) {
        try {
          pngData = await embedRef.current.getPNG({
            result: "dataURL",
            layout: "track",
            dpi: 300,
          })
          console.log("PNG data:", pngData)
        } catch (error) {
          console.error("Error getting PNG:", error)
        }
        const jsonData = await embedRef.current.getJSON()
        console.log("Full JSON data from getJSON:", jsonData)
        extractedData = extractMusicSheetData(jsonData['score-partwise'])
        console.log("Extracted Music Sheet Data:", extractedData)

        
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "system",
            content: "You are a music assistant analyzing sheet music. Please provide detailed analysis of the score. Don't mention about the source of the score (e.g music xml), just analyze the score.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `User question: ${message}\nScore Data: ${JSON.stringify(extractedData)}`,
              },
              // {
              //   type: "image_url",
              //   image_url: {
              //     url: pngData,
              //     detail: "high",
              //   },
              // },
            ],
          },
        ],
        response_format: {
          type: "text",
        },
        temperature: 1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })

      const chatGPTResponse = response.choices[0].message.content?.trim()
      console.log("ChatGPT Response:", chatGPTResponse)

      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, `MusicAI: ${chatGPTResponse}`]
        return updatedMessages
      })
    } catch (error) {
      console.error("Error communicating with ChatGPT:", error)
      setChatMessages((prevMessages) => [...prevMessages, `MusicAI: Sorry, I encountered an error.`])
    }
  }

  const handleChatInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement
      const newMessage = input.value.trim()
      if (newMessage) {
        setChatMessages((prevMessages) => [...prevMessages, `You: ${newMessage}`])
        sendMessageToChatGPT(newMessage)
        input.value = ""
      }
    }
  }

  // Handle rating submission
  const handleRating = async (rating: number) => {
    if (!user || !score) return

    setRatingLoading(true)
    try {
      const scoreRef = doc(db, "scores", id)
      const scoreDoc = await getDoc(scoreRef)
      
      if (!scoreDoc.exists()) {
        throw new Error("Score not found")
      }

      const scoreData = scoreDoc.data()
      const currentRatings = scoreData.ratings || {}
      const currentRating = scoreData.rating || 0
      const currentRatingCount = scoreData.ratingCount || 0
      const previousUserRating = currentRatings[user.uid] || 0

      // Update user's rating
      const newRatings = {
        ...currentRatings,
        [user.uid]: rating
      }

      // Calculate new average rating
      let newRating = currentRating
      let newRatingCount = currentRatingCount

      if (previousUserRating === 0) {
        // New rating
        newRating = ((currentRating * currentRatingCount) + rating) / (currentRatingCount + 1)
        newRatingCount = currentRatingCount + 1
      } else {
        // Updated rating
        newRating = ((currentRating * currentRatingCount) - previousUserRating + rating) / currentRatingCount
      }

      // Update the document
      await updateDoc(scoreRef, {
        ratings: newRatings,
        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
        ratingCount: newRatingCount
      })

      // Update local state
      setScore(prev => prev ? {
        ...prev,
        rating: Math.round(newRating * 10) / 10,
        ratingCount: newRatingCount,
        userRating: rating
      } : null)

    } catch (error) {
      console.error("Error updating rating:", error)
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans dark:bg-gray-900 dark:text-white">
        {t("loading", { ns: "dashboard" })}
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-sans dark:bg-gray-900">
        {error}
      </div>
    )
  }

  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans dark:bg-gray-900 dark:text-white">
        {t("noScores", { ns: "dashboard" })}
      </div>
    )
  }

  const isOwner = user?.uid === score.userId

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5] dark:bg-gray-900 font-sans">
      <TopMenu user={user} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 mt-16 w-full">
        <div className="mb-6">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center hover:underline"
            style={{ color: linkColor }}
          >
            <ArrowLeft className="mr-2" />
            {t("backToScores", { ns: "dashboard" })}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-[#333333] dark:text-white mb-4">{score.name}</h1>
        <p className="text-lg text-[#666666] dark:text-gray-300 mb-6">
          {t("by", { ns: "dashboard" })} <Link href={`/user/${score.userId}`} className="hover:underline" style={{ color: linkColor }}>{score.author}</Link>
        </p>
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating
                  rating={score.rating || 0}
                  onRatingChange={handleRating}
                  userRating={score.userRating}
                  disabled={ratingLoading || !user}
                />
                <span className="text-sm text-[#666666] dark:text-gray-400">
                  {score.rating ? `${score.rating.toFixed(1)}` : "0.0"} 
                  {score.ratingCount ? ` (${score.ratingCount} ${score.ratingCount === 1 ? t('vote', { ns: 'dashboard' }) : t('votes', { ns: 'dashboard' })})` : ""}
                </span>
              </div>
            </div>
            {!user && (
              <p className="text-sm text-[#666666] dark:text-gray-400">
                {t("loginToRate", { ns: "dashboard", defaultValue: "Login to rate this score" })}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg overflow-hidden mb-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md flex-1 flex items-stretch rounded-lg">
            <CardContent className="p-4 flex justify-center items-center w-full">
              <div key={themeKey} ref={containerRef} style={{ height: "450px", width: "100%" }} className="flex-1 flex items-center justify-center" />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={async () => {
              if (embedRef.current) {
                const currentZoom = await embedRef.current.getZoom();
                await embedRef.current.setZoom(Math.max(0.5, currentZoom - 0.1));
              }
            }}
            className="p-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: buttonColor }}
            title={t("zoomOut", { ns: "dashboard" })}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              if (embedRef.current) {
                const currentZoom = await embedRef.current.getZoom();
                await embedRef.current.setZoom(Math.min(2, currentZoom + 0.1));
              }
            }}
            className="p-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: buttonColor }}
            title={t("zoomIn", { ns: "dashboard" })}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              if (embedRef.current) {
                const newAutoZoomState = !isAutoZoom;
                await embedRef.current.setAutoZoom(newAutoZoomState);
                setIsAutoZoom(newAutoZoomState);
              }
            }}
            className={`p-1.5 rounded-full text-white hover:opacity-90 transition-opacity ${isAutoZoom ? 'bg-opacity-100' : 'bg-opacity-70'}`}
            style={{ backgroundColor: buttonColor }}
            title={t("autoZoom", { ns: "dashboard" })}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-sm text-[#666666] dark:text-gray-400">
            {t("modified", { ns: "dashboard" })}: {score.modified.toLocaleString()}
          </p>
          {isOwner && (
            <>
              <button 
                onClick={handleEdit} 
                className="font-medium hover:text-[#800000] dark:hover:text-[#e5a3b4] dark:text-white"
              >
                {t("edit", { ns: "dashboard" })}
              </button>
            </>
          )}
        </div>
        {score.description && score.description.trim() !== "" && (
          <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold mb-2 text-[#333] dark:text-white">{t("description", { ns: "dashboard", defaultValue: "Description" })}</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{score.description}</p>
          </div>
        )}
      </main>

      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none"
        style={{ backgroundColor: buttonColor }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-16 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-80 h-96 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white">{t("chat", { ns: "dashboard" })}</h2>
            <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {chatMessages.map((message, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-xs" style={{ alignSelf: "flex-start" }}>
                <span className="dark:text-white">{message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            <input
              type="text"
              placeholder={t("typeAMessage", { ns: "dashboard" })}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              onKeyDown={handleChatInputKeyDown}
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
