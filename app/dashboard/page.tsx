"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, DoorClosedIcon as CloseIcon } from "lucide-react"
import { WebcamIcon as ChatIcon } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import Link from "next/link"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { ProtectedRoute } from "@/app/components/auth/protectedroute"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { TopMenu } from "@/app/components/layout/TopMenu"
import { SortableTable } from "@/app/components/common/SortableTable"
import OpenAI from "openai"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"
import { useAuth } from "@/app/providers/auth-provider"
import Footer from "../components/layout/Footer"

interface Score {
  name: string
  modified: string
  sharing: string
  score_id: string
}

const loadChatMessages = () => {
  if (typeof window === "undefined") return []

  try {
    return JSON.parse(localStorage.getItem("chatMessages") || "[]")
  } catch (error) {
    console.error("Error parsing chat messages from localStorage:", error)
    return []
  }
}

const saveChatMessages = (messages: string[]) => {
  localStorage.setItem("chatMessages", JSON.stringify(messages))
}

export default function Dashboard() {
  const [scores, setScores] = React.useState<Score[]>([])
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [chatMessages, setChatMessages] = React.useState<string[]>(loadChatMessages())
  const [isLoading, setIsLoading] = React.useState(true)
  const chatEndRef = React.useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const { t } = useTranslation("dashboard")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { user } = useAuth()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware colors
  const maroonColor = "#4A1D2C"
  const maroonDark = "#8A3D4C"
  const buttonColor = mounted && resolvedTheme === "dark" ? maroonDark : maroonColor
  const linkColor = mounted && resolvedTheme === "dark" ? "#e5a3b4" : "#800000"
  
  // Background colors matching the landing page
  const pageBg = mounted && resolvedTheme === "dark" ? "#1a1f2c" : "#f3f4f6" 
  const cardBg = mounted && resolvedTheme === "dark" ? "#242A38" : "white"
  const inputBg = mounted && resolvedTheme === "dark" ? "#212838" : "#f9fafb"
  const inputBorder = mounted && resolvedTheme === "dark" ? "#323A4B" : "#e5e7eb"
  const popoverBg = mounted && resolvedTheme === "dark" ? "#242A38" : "white"

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    dangerouslyAllowBrowser: true,
  })

  React.useEffect(() => {
    const fetchUserScores = async () => {
      if (!user?.uid) return

      try {
        setIsLoading(true)
        const q = query(collection(db, "scores"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const userScores = querySnapshot.docs.map((doc) => ({
          name: doc.data().name,
          modified: new Date(doc.data().modified.toDate()).toLocaleDateString(),
          sharing: doc.data().sharing
            ? doc.data().sharing.charAt(0).toUpperCase() + doc.data().sharing.slice(1)
            : "Only me",
          score_id: doc.id,
        }))

        setScores(userScores)
      } catch (error) {
        console.error("Error fetching scores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserScores()
  }, [user])

  const sendMessageToChatGPT = async (message: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: message }],
        max_tokens: 150,
      })

      const chatGPTResponse = response.choices[0].message.content?.trim()

      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, `MusicAI: ${chatGPTResponse}`]
        saveChatMessages(updatedMessages)
        return updatedMessages
      })
    } catch (error) {
      console.error("Error communicating with ChatGPT:", error)
      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, `MusicAI: Sorry, I encountered an error.`]
        saveChatMessages(updatedMessages)
        return updatedMessages
      })
    }
  }

  const toggleChat = () => setIsChatOpen(!isChatOpen)

  const handleChatInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement
      const newMessage = input.value.trim()
      if (newMessage) {
        setChatMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, `You: ${newMessage}`]
          saveChatMessages(updatedMessages)
          return updatedMessages
        })
        sendMessageToChatGPT(newMessage)
        input.value = ""
      }
    }
  }

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  const handleDeleteScore = async (scoreId: string) => {
    try {
      await deleteDoc(doc(db, "scores", scoreId))
      setScores(scores.filter((score) => score.score_id !== scoreId))
    } catch (error) {
      console.error("Error deleting score:", error)
    }
  }

  const columns = [
    {
      key: "name" as keyof Score,
      label: t("scoreName"),
      render: (score: Score) => (
        <Link href={`/score/${score.score_id}`} className={`hover:text-[${linkColor}]`}>
          {score.name}
        </Link>
      ),
    },
    { key: "modified" as keyof Score, label: t("modified") },
    { key: "sharing" as keyof Score, label: t("sharing") },
  ]

  const renderActions = (score: Score) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-1">
          <MoreVertical className="h-5 w-5 text-[#666666] dark:text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 dark:border-gray-700" style={{ background: popoverBg }}>
        <div className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            className="justify-start text-sm text-red-600 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteScore(score.score_id)
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c] transition-colors duration-300" style={{ background: pageBg }}>
        <TopMenu />
        <main className="flex-grow max-w-7xl mx-auto px-4 pt-20 pb-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#333333] dark:text-white">{t("myScores")}</h1>

            <Link href="/new-score" className="inline-block">
              <Button 
                className="shadow-sm font-medium transition-transform hover:scale-105"
                style={{ backgroundColor: buttonColor, color: "white" }}
              >
                {t("newScore")}
              </Button>
            </Link>
          </div>
          <Card className="bg-white shadow-md transition-colors duration-300" style={{ background: cardBg }}>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#800000] border-r-transparent dark:border-[#8A3D4C] dark:border-r-transparent"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">{t("loading")}</p>
                </div>
              ) : (
                <SortableTable
                  data={scores}
                  columns={columns}
                  initialSortColumn="name"
                  emptyMessage={t("noScores")}
                  actions={renderActions}
                  onRowClick={(score) => router.push(`/score/${score.score_id}`)}
                />
              )}
            </CardContent>
          </Card>
        </main>

        {/* Chat Bubble */}
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 bg-secondary text-white p-3 rounded-full shadow-lg hover:bg-secondary-hover focus:outline-none"
          style={{ backgroundColor: buttonColor }}
          aria-label="Open chat"
        >
          <ChatIcon className="h-6 w-6" />
        </button>

        {/* Chat UI */}
        {isChatOpen && (
          <div className="fixed bottom-16 right-4 shadow-lg rounded-lg w-80 h-96 flex flex-col transition-colors duration-300" style={{ background: cardBg }}>
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold dark:text-white">{t("chat")}</h2>
              <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" aria-label="Close chat">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className="mb-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-xs"
                  style={{ alignSelf: "flex-start" }}
                >
                  <span className="dark:text-white">{message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-700">
              <input
                type="text"
                placeholder={t("typeAMessage")}
                className="w-full border rounded p-2 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                style={{ background: inputBg, borderColor: inputBorder }}
                onKeyDown={handleChatInputKeyDown}
                aria-label="Type a message"
              />
            </div>
          </div>
        )}
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
