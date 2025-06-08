"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/app/components/ui/button"
import { useTheme } from "next-themes"
import { Sparkles } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface EditorProps {
  title: string
  user: any
  description?: string
  onGenerateDescription?: () => void
}

const Editor = forwardRef(({ title, user, description, onGenerateDescription }: EditorProps, ref) => {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const embedRef = useRef<any>(null)
  const [exportCount, setExportCount] = useState(0)
  const [scoreId, setScoreId] = useState<string | null>(null)
  const [scoreDescription, setScoreDescription] = useState(description || "")
  const maxExports = 5
  const exportInterval = 30000
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware colors
  const maroonColor = "#4A1D2C"
  const maroonDark = "#8A3D4C"
  const buttonColor = mounted && resolvedTheme === "dark" ? maroonDark : maroonColor
  const linkColor = mounted && resolvedTheme === "dark" ? "#e5a3b4" : "#800000"

  const createScore = async () => {
    try {
      const response = await axios({
        method: "post",
        url: "https://api.flat.io/v2/scores",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c",
        },
        data: {
          title: title,
          description: scoreDescription,
          builderData: {
            scoreData: {
              instruments: [
                {
                  group: "keyboards",
                  instrument: "piano",
                },
              ],
            },
          },
          privacy: "public",
        },
      })

      const newScoreId = response.data.id
      setScoreId(newScoreId)

      const scoresRef = collection(db, "scores")
      const q = query(scoresRef, where("name", "==", title))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const scoreDoc = querySnapshot.docs[0]
        await updateDoc(doc(db, "scores", scoreDoc.id), {
          flatid: newScoreId,
        })
      }

      return newScoreId
    } catch (error) {
      console.error("Error creating score:", error)
      return null
    }
  }

  const handleSave = async (isAutoSave = false) => {
    if (!embedRef.current || !scoreId) return

    try {
      const buffer = await embedRef.current.getMusicXML({ compressed: false })
      console.log("buffer", buffer)
      console.log("typeof buffer:", typeof buffer)
      if (buffer && typeof buffer === 'object') {
        console.log("buffer.constructor:", buffer.constructor?.name)
        console.log("Object.keys(buffer):", Object.keys(buffer))
      }
      let xmlString = ""
      let base64String = ""
      if (typeof buffer === "string") {
        xmlString = buffer
        // Unicode-safe base64 encoding
        base64String = btoa(unescape(encodeURIComponent(xmlString)))
      } else if (buffer instanceof ArrayBuffer) {
        const uint8arr = new Uint8Array(buffer)
        xmlString = new TextDecoder().decode(uint8arr)
        base64String = btoa(uint8arr.reduce((data, byte) => data + String.fromCharCode(byte), ""))
      } else if (ArrayBuffer.isView(buffer)) {
        const uint8arr = new Uint8Array(buffer.buffer)
        xmlString = new TextDecoder().decode(uint8arr)
        base64String = btoa(uint8arr.reduce((data, byte) => data + String.fromCharCode(byte), ""))
      } else {
        throw new Error("getMusicXML did not return a string, ArrayBuffer, or TypedArray")
      }
      console.log("`MusicXML`:", xmlString)

      const jsonData = await embedRef.current.getJSON()
      console.log("JSON data:", jsonData)

      const saveData = {
        title,
        description: scoreDescription,
        timestamp: new Date().toISOString(),
        content: base64String,
      }

      const storageKey = isAutoSave
        ? `score_${title}_autosave_${exportCount + 1}`
        : `score_${title}_manual_${Date.now()}`

      localStorage.setItem(storageKey, JSON.stringify(saveData))

      const versionsList = JSON.parse(localStorage.getItem(`score_${title}_versions`) || "[]")
      versionsList.push({
        version: isAutoSave ? `Auto Save ${exportCount + 1}` : `Manual Save ${versionsList.length + 1}`,
        timestamp: saveData.timestamp,
        storageKey,
      })
      localStorage.setItem(`score_${title}_versions`, JSON.stringify(versionsList))

      try {
        await axios({
          method: "post",
          url: `https://api.flat.io/v2/scores/${scoreId}/revisions`,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c",
          },
          data: {
            data: base64String,
            dataEncoding: "base64",
            autosave: isAutoSave,
          },
        })

        if (isAutoSave) {
          setExportCount((prev) => prev + 1)
        }
      } catch (apiError) {
        console.error("Error saving to Flat.io:", apiError)
      }
    } catch (error) {
      console.error("Error in save:", error)
    }
  }

  const getSavedVersions = () => {
    try {
      return JSON.parse(localStorage.getItem(`score_${title}_versions`) || "[]")
    } catch (error) {
      console.error("Error retrieving saved versions:", error)
      return []
    }
  }

  const loadVersion = (storageKey: string) => {
    try {
      const savedData = JSON.parse(localStorage.getItem(storageKey) || "")
      if (savedData) {
        const content = savedData.content
        return content
      }
    } catch (error) {
      console.error("Error loading version:", error)
    }
    return null
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      const newScoreId = await createScore()
      if (!mounted || !newScoreId) return

      if (typeof window !== "undefined") {
        const script = document.createElement("script")
        script.src = "https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js"
        script.async = true
        script.onload = () => {
          if (!mounted || !containerRef.current || !window.Flat) return

          // Use theme-aware color for the embed
          const embedThemeColor = resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C"
          const embedControlsBackground = resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF"
          const embedScoreBackground = resolvedTheme === "dark" ? "transparent" : "white"

          embedRef.current = new window.Flat.Embed(containerRef.current, {
            score: newScoreId,
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
            },
          })

          if (!embedRef.current) {
            console.error("Failed to initialize Flat.Embed")
          }
        }
        document.body.appendChild(script)
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (!scoreId || exportCount >= maxExports) return

    const intervalId = setInterval(() => {
      handleSave(true)
    }, exportInterval)

    return () => clearInterval(intervalId)
  }, [scoreId, exportCount])

  useImperativeHandle(ref, () => ({
    async getScoreJSON() {
      if (embedRef.current) {
        return await embedRef.current.getJSON();
      }
      return null;
    },
    setScoreDescription(desc: string) {
      setScoreDescription(desc);
    }
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 mt-16">
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="flex items-center hover:underline"
          style={{ color: linkColor }}
        >
          <ArrowLeft className="mr-2" />
          Back to Score Details
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#333333] dark:text-white mb-2">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">By {user?.displayName || "Anonymous"}</p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div ref={containerRef} style={{ height: "450px", width: "100%" }} />
        <div className="p-6 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => handleSave(false)}
              className="shadow-sm font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: buttonColor, color: "white" }}
            >
              Save Version
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Saved Versions</h3>
            <div className="space-y-2">
              {getSavedVersions().map((version: any) => (
                <div key={version.storageKey} className="flex items-center justify-between text-sm dark:text-gray-300">
                  <span>
                    Version {version.version} - {new Date(version.timestamp).toLocaleString()}
                  </span>
                  <Button onClick={() => loadVersion(version.storageKey)} variant="link" style={{ color: linkColor }}>
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TooltipProvider>
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-400 cursor-pointer">
                  <Sparkles className="w-4 h-4 text-white" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                The AI can help you generate description of music based on your music sheet
              </TooltipContent>
            </Tooltip>
            <Button className="ml-2" type="button" onClick={onGenerateDescription}>
              Generate Description
            </Button>
          </div>
          <textarea
            id="description"
            value={scoreDescription}
            onChange={(e) => setScoreDescription(e.target.value)}
            placeholder="Enter a description for your score..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A1D2C] dark:focus:ring-[#8A3D4C] focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={3}
          />
        </div>
      </TooltipProvider>
    </main>
  )
})

Editor.displayName = "Editor"

export default Editor
