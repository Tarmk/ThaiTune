"use client"

import { ReactNode, useEffect, useState } from "react"

interface NoSSRProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Component that prevents Server-Side Rendering to avoid flashing of untranslated content
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 