"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { TopMenu } from "@/app/components/layout/TopMenu"
import dynamic from "next/dynamic"

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <TopMenu user={user} />
      <Editor title={title} user={user} />
    </div>
  )
}

export default CreateNewScorePage2
