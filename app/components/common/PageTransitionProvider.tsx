"use client"

import { ReactNode, createContext, useContext, useEffect, useState, Suspense } from "react"
import { usePathname } from "next/navigation"

interface PageTransitionContextType {
  isNavigating: boolean
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isNavigating: false,
})

export const usePageTransition = () => useContext(PageTransitionContext)

// Component that uses useSearchParams inside Suspense
function PageTransitionContent({ 
  children, 
  setIsNavigating, 
  mounted 
}: { 
  children: ReactNode;
  setIsNavigating: (value: boolean) => void;
  mounted: boolean;
}) {
  const pathname = usePathname()
  // We'll import useSearchParams here to ensure it's used only inside Suspense
  const { useSearchParams } = require("next/navigation")
  const searchParams = useSearchParams()
  
  // Handle route changes
  useEffect(() => {
    if (!mounted) return;

    setIsNavigating(true)
    
    // Longer delay to ensure transitions feel smoother
    const timeout = setTimeout(() => {
      setIsNavigating(false)
    }, 300)
    
    return () => clearTimeout(timeout)
  }, [pathname, searchParams, mounted, setIsNavigating])
  
  return <>{children}</>
}

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted after initial load
  useEffect(() => {
    setMounted(true)
  }, [])

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
        <Suspense fallback={<div>{children}</div>}>
          <PageTransitionContent 
            setIsNavigating={setIsNavigating} 
            mounted={mounted}
          >
            {children}
          </PageTransitionContent>
        </Suspense>
      </div>
    </PageTransitionContext.Provider>
  )
} 