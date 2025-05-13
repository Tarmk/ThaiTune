"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface PageTransitionContextType {
  isNavigating: boolean
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isNavigating: false,
})

export const usePageTransition = () => useContext(PageTransitionContext)

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted after initial load
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle route changes
  useEffect(() => {
    if (!mounted) return;

    setIsNavigating(true)
    
    // Longer delay to ensure transitions feel smoother
    const timeout = setTimeout(() => {
      setIsNavigating(false)
    }, 300)
    
    return () => clearTimeout(timeout)
  }, [pathname, searchParams, mounted])

  return (
    <PageTransitionContext.Provider value={{ isNavigating }}>
      <style jsx global>{`
        /* Preserve button states during navigation */
        button:active {
          transform: ${isNavigating ? 'scale(0.98)' : 'none'};
          opacity: ${isNavigating ? '0.9' : '1'};
        }
        
        /* Add a class to preserve active button styles during navigation */
        .navigation-active {
          transform: scale(0.98);
          opacity: 0.9;
        }
      `}</style>
      <div
        className={`min-h-screen transition-all duration-300 ${
          isNavigating ? "opacity-95 blur-[0.5px]" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </PageTransitionContext.Provider>
  )
} 