"use client"

import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { TopMenu } from "@/app/components/layout/TopMenu"
import { Card, CardContent } from "@/components/ui/card"
// Update the Button import to use our custom Button component
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ClientProps {
  id: string
}

export default function EditScoreClient({ id }: ClientProps) {
  const { t } = useTranslation("editor")
  const [user, setUser] = useState<any>(null)
  const [flatId, setFlatId] = useState<string | null>(null)
  const [title, setTitle] = useState<string>("")
  const [score, setScore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const embedRef = useRef<any>(null)
  const initializeRef = useRef(false)

  const [exportCount, setExportCount] = useState(0)
  const exportInterval = 30000
  const [sharingSetting, setSharingSetting] = useState<string>("private")
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    const fetchScore = async () => {
      setLoading(true)
      try {
        const scoreDoc = await getDoc(doc(db, "scores", id))
        console.log("Score id:", id)
        if (scoreDoc.exists()) {
          const scoreData = scoreDoc.data()
          setScore(scoreData)
          if (scoreData) {
            if (scoreData.flatid) setFlatId(scoreData.flatid)
            if (scoreData.name) setTitle(scoreData.name)
            if (scoreData.sharing) setSharingSetting(scoreData.sharing)
          } else {
            setError("Score data is undefined")
          }
        } else {
          setError("Score not found")
        }
      } catch (err: any) {
        console.error("Error fetching score:", err.message || err)
        setError("Error fetching score")
      } finally {
        setLoading(false)
      }
    }

    fetchScore()
    return () => unsubscribe()
  }, [id])

  useEffect(() => {
    if (initializeRef.current || !flatId) return
    initializeRef.current = true

    const initializeEmbed = () => {
      if (containerRef.current && window.Flat && flatId) {
        embedRef.current = new window.Flat.Embed(containerRef.current, {
          score: flatId,
          embedParams: {
            mode: "edit",
            appId: "6755790be2eebcce112acde7",
            branding: false,
            controlsPosition: "top",
            themePrimary: "#800000",
          },
        })
        console.log("Embed ref set")
      }
    }

    const script = document.createElement("script")
    script.src = "https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js"
    script.async = true
    script.onload = initializeEmbed
    document.body.appendChild(script)
  }, [flatId])

  const handleManualSave = async () => {
    if (embedRef.current && flatId) {
      try {
        const buffer = await embedRef.current.getMusicXML({ compressed: true })

        const base64String = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""))

        // Save to localStorage
        const saveData = {
          title,
          timestamp: new Date().toISOString(),
          content: base64String,
        }

        const storageKey = `score_${title}_manual_${Date.now()}`
        localStorage.setItem(storageKey, JSON.stringify(saveData))

        // Update versions list
        const versionsList = JSON.parse(localStorage.getItem(`score_${title}_versions`) || "[]")
        versionsList.push({
          version: `Manual Save ${versionsList.length + 1}`,
          timestamp: saveData.timestamp,
          storageKey,
        })
        localStorage.setItem(`score_${title}_versions`, JSON.stringify(versionsList))

        // Save to Flat.io API
        try {
          const response = await axios({
            method: "post",
            url: `https://api.flat.io/v2/scores/${flatId}/revisions`,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization:
                "069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c",
            },
            data: {
              data: base64String,
              dataEncoding: "base64",
              autosave: false, // Set to false for manual saves
            },
          })
          console.log("Manual save to Flat.io successful:", response.data)
        } catch (apiError) {
          console.error("Error saving to Flat.io:", apiError)
        }

        setLastSavedTime(new Date().toLocaleTimeString())
      } catch (error) {
        console.error("Error in manual save:", error)
      }
    }
  }

  const handleAutoSave = React.useCallback(async () => {
    console.log("Auto-save triggered")
    if (embedRef.current && flatId) {
      try {
        const buffer = await embedRef.current.getMusicXML({ compressed: true })

        const base64String = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""))

        // Update modified timestamp using Firestore's serverTimestamp
        const scoreRef = doc(db, "scores", id)
        await updateDoc(scoreRef, {
          modified: serverTimestamp(),
        })

        const saveData = {
          title,
          timestamp: new Date().toISOString(),
          content: base64String,
        }

        const storageKey = `score_${title}_autosave_${exportCount + 1}`
        localStorage.setItem(storageKey, JSON.stringify(saveData))

        const versionsList = JSON.parse(localStorage.getItem(`score_${title}_versions`) || "[]")
        versionsList.push({
          version: `Auto Save ${exportCount + 1}`,
          timestamp: saveData.timestamp,
          storageKey,
        })
        localStorage.setItem(`score_${title}_versions`, JSON.stringify(versionsList))

        // Save to Flat.io API
        try {
          const response = await axios({
            method: "post",
            url: `https://api.flat.io/v2/scores/${flatId}/revisions`,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization:
                "069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c",
            },
            data: {
              data: base64String,
              dataEncoding: "base64",
              autosave: true,
            },
          })
          console.log("Auto-save to Flat.io successful:", response.data)
        } catch (apiError) {
          console.error("Error auto-saving to Flat.io:", apiError)
        }

        setLastSavedTime(new Date().toLocaleTimeString())
        setExportCount((prev) => prev + 1)
      } catch (error) {
        console.error("Error in auto-save:", error)
      }
    } else {
      console.log("Auto-save skipped - conditions not met:", {
        hasEmbed: !!embedRef.current,
        flatId,
      })
    }
  }, [flatId, exportCount, title, id])

  // Set up auto-save interval
  useEffect(() => {
    if (!flatId) return

    handleAutoSave()
    console.log("Setting up auto-save interval")
    const intervalId = setInterval(handleAutoSave, exportInterval)

    return () => {
      console.log("Clearing auto-save interval")
      clearInterval(intervalId)
    }
  }, [flatId, handleAutoSave])

  const updateSharingSetting = async (newSetting: string) => {
    if (!id) return
    try {
      await updateDoc(doc(db, "scores", id), {
        sharing: newSetting,
      })
      setSharingSetting(newSetting)
    } catch (error) {
      console.error("Error updating sharing setting:", error)
    }
  }

  const handleSharingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSetting = event.target.value
    updateSharingSetting(newSetting)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <TopMenu user={user} />
      <main className="max-w-7xl mx-auto px-4 py-6 mt-16">
        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center text-[#800000] hover:underline">
            <ArrowLeft className="mr-2" />
            {t("back")}
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#333333]">{title}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label htmlFor="sharing" className="mr-2 text-[#666666]">
                {t("sharing")}:
              </label>
              <select
                id="sharing"
                value={sharingSetting}
                onChange={handleSharingChange}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="private">{t("private")}</option>
                <option value="public">{t("public")}</option>
              </select>
            </div>
            {/* Update the save button */}
            <Button onClick={handleManualSave} variant="secondary">
              {t("save")}
            </Button>
          </div>
        </div>

        {lastSavedTime && (
          <p className="text-sm text-[#666666] mb-4">
            {t("lastSaved")}: {lastSavedTime}
          </p>
        )}

        <Card className="bg-white shadow-md mb-6">
          <CardContent className="p-4">
            <div ref={containerRef} style={{ height: "600px", width: "100%" }} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
