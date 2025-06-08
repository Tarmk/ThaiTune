"use client"

import { useEffect, useState, useRef } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { TopMenu } from "@/app/components/layout/TopMenu"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import OpenAI from "openai"

interface FlatEmbed {
  getMusicXML: (options: { compressed: boolean }) => Promise<ArrayBuffer>
}

declare global {
  interface Window {
    Flat: {
      Embed: new (container: HTMLDivElement, options: any) => FlatEmbed
    }
  }
}

// Separate component for the editor
const Editor = dynamic(() => import("./editor"), { ssr: false })

// Main component
const CreateNewScorePage2 = ({ title }: { title: string }) => {
  const [user, setUser] = useState<any>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<any>(null)
  const [isLoadingDescription, setIsLoadingDescription] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleGenerateDescription = async () => {
    if (editorRef.current && editorRef.current.getScoreJSON) {
      setIsLoadingDescription(true)
      const json = await editorRef.current.getScoreJSON();
      // Extract music sheet data (copied from ScoreDetailsPage.tsx)
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
      const extractedData = extractMusicSheetData(json?.['score-partwise']);
      // Call OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "sk-svcacct-U1ZLkSvtRFwAzPLrR-XseW0sNZ-rHNf1Mtw5k2s_DNhjj5HxrU_SnVsxlikcjKaT3BlbkFJKFNz4Cza_cDEewCihVQ22wduNQ_JVG6qI-cDZJqgEuWMp0cuAmTn5lY8vdeFYUAA",
        dangerouslyAllowBrowser: true,
      });
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4.1-2025-04-14",
          messages: [
            {
              role: "system",
              content: "You are a music assistant analyzing sheet music. Please provide detailed analysis of the score. Don't mention about the source of the score (e.g music xml), just analyze the score. Output as text (Don't use markdown formatting).",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `User question: Please generate a description for this music score.\nScore Data: ${JSON.stringify(extractedData)}`,
                },
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
        });
        const chatGPTResponse = response.choices[0].message.content?.trim();
        // Set the description in the editor
        if (editorRef.current && editorRef.current.setScoreDescription) {
          editorRef.current.setScoreDescription(chatGPTResponse);
        } else {
          // fallback: try to set textarea value directly if possible
          const textarea = document.getElementById("description") as HTMLTextAreaElement;
          if (textarea) textarea.value = chatGPTResponse || "";
        }
      } catch (error) {
        console.error("Error communicating with ChatGPT:", error);
        alert("Failed to generate description. Please try again.");
      } finally {
        setIsLoadingDescription(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopMenu user={user} />
      <Editor ref={editorRef} title={title} user={user} onGenerateDescription={handleGenerateDescription} />
      {isLoadingDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4A1D2C] dark:border-[#8A3D4C] mb-4"></div>
            <span className="text-lg font-semibold dark:text-white">Generating description...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateNewScorePage2
