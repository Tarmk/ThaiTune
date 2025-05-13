"use client"

import React, { useState, useRef, useEffect, Suspense } from "react"
import axios from "axios"
import { usePathname, useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { TopMenu } from "@/app/components/layout/TopMenu"
import { Card, CardContent } from "@/components/ui/card"
// Update the Button import to use our custom Button component
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

interface ClientProps {
  id: string
}

// Component that uses useSearchParams inside Suspense
function SearchParamsHandler({ onParamsReady }: { onParamsReady: (params: URLSearchParams) => void }) {
  const { useSearchParams } = require("next/navigation")
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (searchParams) {
      onParamsReady(searchParams)
    }
  }, [searchParams, onParamsReady])
  
  return null
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
  const [searchParamsObj, setSearchParamsObj] = useState<URLSearchParams | null>(null)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const embedRef = useRef<any>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const initializeRef = useRef(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [themeKey, setThemeKey] = useState(0)

  const [exportCount, setExportCount] = useState(0)
  const exportInterval = 30000
  const [sharingSetting, setSharingSetting] = useState<string>("private")
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)

  // Function to handle search params
  const handleSearchParams = React.useCallback((params: URLSearchParams) => {
    setSearchParamsObj(params)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware colors
  const maroonColor = "#4A1D2C"
  const maroonDark = "#8A3D4C"
  const buttonColor = mounted && resolvedTheme === "dark" ? maroonDark : maroonColor
  const linkColor = mounted && resolvedTheme === "dark" ? "#e5a3b4" : "#800000"

  // Effect to update themeKey when resolvedTheme changes
  useEffect(() => {
    if (mounted) {
      setThemeKey(prevKey => prevKey + 1)
    }
  }, [resolvedTheme, mounted])

  // Clean up function to remove script and reset embed
  const cleanupEmbed = React.useCallback(() => {
    // Reset the embed reference
    if (embedRef.current) {
      embedRef.current = null
    }
    
    // Remove the script if it exists
    if (scriptRef.current && document.body.contains(scriptRef.current)) {
      document.body.removeChild(scriptRef.current)
      scriptRef.current = null
    }
  }, [])

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
    if (!flatId || !mounted) return
    
    // Clean up previous embed and script
    cleanupEmbed()
    
    console.log("Creating embed with theme:", resolvedTheme)

    const script = document.createElement("script")
    script.src = "https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js"
    script.async = true
    scriptRef.current = script
    
    script.onload = () => {
      if (containerRef.current && window.Flat && flatId) {
        // Use theme-aware color for the embed
        const embedThemeColor = resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C"
        const embedControlsBackground = resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF"
        const embedScoreBackground = resolvedTheme === "dark" ? "transparent" : "white"
        
        embedRef.current = new window.Flat.Embed(containerRef.current, {
          score: flatId,
          embedParams: {
            mode: "edit",
            appId: "6755790be2eebcce112acde7",
            branding: false,
            controlsPosition: "top",
            themePrimary: embedThemeColor,
            themePrimaryDark: embedThemeColor,
            themeControlsBackground: embedControlsBackground,
            themeScoreBackground: embedScoreBackground,
            themeCursorV0: embedThemeColor,
            themePageBackgroundV0: resolvedTheme === "dark" ? "#272727" : "white",
            themePageMarginBackgroundV0: resolvedTheme === "dark" ? "#272727" : "white",
            themePageColor: resolvedTheme === "dark" ? "#FFFFFF" : "#000000",
            themeTimeSignatureV0: resolvedTheme === "dark" ? "#FFFFFF" : "#000000",
            themeColorWe: resolvedTheme === "dark" ? "#FFFFFF" : "#000000",
            forceBackgroundMode: resolvedTheme === "dark" ? "dark" : "light",
          },
        })
        console.log("Embed ready with theme:", resolvedTheme)
      }
    }
    
    document.body.appendChild(script)

    return () => {
      cleanupEmbed()
    }
  }, [flatId, mounted, resolvedTheme, themeKey, cleanupEmbed])

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
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 dark:bg-gray-900">{error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsReady={handleSearchParams} />
      </Suspense>
      <TopMenu user={user} />
      <div className="p-4 md:p-6 flex-grow flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            style={{ color: linkColor }}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("back")}
          </Button>
          
          {/* Save button */}
          <Button 
            variant="default"
            size="sm"
            onClick={handleManualSave}
            style={{ 
              backgroundColor: buttonColor,
              color: "white",
              marginLeft: "8px"
            }}
          >
            {t("save")}
          </Button>
          
          {/* Last saved indicator */}
          {lastSavedTime && (
            <span className="text-xs text-muted-foreground">
              {t("last_saved")}: {lastSavedTime}
            </span>
          )}
          
          {/* Sharing dropdown */}
          <div className="ml-auto flex items-center space-x-2">
            <label htmlFor="sharing" className="text-sm font-medium">
              {t("sharing")}:
            </label>
            <select
              id="sharing"
              className="text-sm border rounded p-1 bg-background"
              value={sharingSetting}
              onChange={handleSharingChange}
              style={{ color: resolvedTheme === "dark" ? "#ffffff" : "#000000" }}
            >
              <option value="private">{t("private")}</option>
              <option value="unlisted">{t("unlisted")}</option>
              <option value="public">{t("public")}</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <p>{t("loading")}</p>
          </div>
        ) : error ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <Card className="flex-grow overflow-hidden">
            <CardContent className="p-0 h-full">
              <div ref={containerRef} className="w-full h-full" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
