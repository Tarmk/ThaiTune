"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageCircle, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

import { Card, CardContent } from "@/app/components/ui/card"
import { auth, db } from "@/lib/firebase"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { TopMenu } from "@/app/components/layout/TopMenu"
import OpenAI from "openai"

interface Score {
  id: string
  name: string
  author: string
  modified: Date
  flatid: string
  userId: string
  sharing: string
}

interface ScoreDetailsPageProps {
  id: string
}

export default function ScoreDetailsPage({ id }: ScoreDetailsPageProps) {
  const [user, setUser] = React.useState<any>(null)
  const [score, setScore] = React.useState<Score | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [authChecked, setAuthChecked] = React.useState(false)
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

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware colors
  const maroonColor = "#800000"
  const maroonDark = "#e5a3b4"
  const buttonColor = mounted && resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C"
  const linkColor = mounted && resolvedTheme === "dark" ? maroonDark : maroonColor

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

          setScore({
            id: scoreDoc.id,
            name: scoreData.name,
            author: scoreData.author,
            modified: scoreData.modified.toDate(),
            flatid: scoreData.flatid,
            userId: scoreData.userId,
            sharing: scoreData.sharing,
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

  const sendMessageToChatGPT = async (message: string) => {
    try {
      let pngData = null
      if (embedRef.current) {
        try {
          pngData = await embedRef.current.getPNG({
            result: "dataURL",
            layout: "track",
            dpi: 300,
          })
        } catch (error) {
          console.error("Error getting PNG:", error)
        }
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a music assistant analyzing sheet music. Please provide detailed analysis of the score.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Score: ${score?.name} ${t("by", { ns: "dashboard" })} ${score?.author}\nUser question: ${message}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: pngData,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 500,
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
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900 font-sans">
      <TopMenu user={user} />
      <main className="max-w-7xl mx-auto px-4 py-6 mt-16">
        <div className="mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center hover:underline"
            style={{ color: linkColor }}
          >
            <ArrowLeft className="mr-2" />
            {t("backToScores", { ns: "dashboard" })}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-[#333333] dark:text-white mb-4">{score.name}</h1>
        <p className="text-lg text-[#666666] dark:text-gray-300 mb-6">
          {t("by", { ns: "dashboard" })} {score.author}
        </p>
        <div className="rounded-lg overflow-hidden mb-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md flex-1 flex items-stretch rounded-lg">
            <CardContent className="p-4 flex justify-center items-center w-full">
              <div key={themeKey} ref={containerRef} style={{ height: "450px", width: "100%" }} className="flex-1 flex items-center justify-center" />
            </CardContent>
          </Card>
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
    </div>
  )
}
