"use client"

import { Suspense, useEffect, useState } from "react"
import EditScoreClient from "./EditScoreClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditScorePage({ params }: PageProps) {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const resolvedParams = await params
        setId(resolvedParams.id)
      } catch (error) {
        console.error("Error resolving params:", error)
      }
    }

    fetchParams()
  }, [params])

  if (id === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1f2c]">
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4A1D2C] dark:border-[#8A3D4C] border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1f2c]">
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4A1D2C] dark:border-[#8A3D4C] border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    }>
      <EditScoreClient id={id} />
    </Suspense>
  )
}
