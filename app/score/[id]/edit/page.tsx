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
    return <div>Loading...</div>
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditScoreClient id={id} />
    </Suspense>
  )
}
