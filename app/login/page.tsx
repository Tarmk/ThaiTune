"use client"

import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, functions, db } from "@/lib/firebase"
import { VerificationCodeInput } from "@/app/components/auth/VerificationCodeInput"
import { useState, useEffect } from "react"
import { httpsCallable } from "firebase/functions"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePageTransition } from "../components/common/PageTransitionProvider"

export default function LoginPage() {
  const router = useRouter()
  const { isNavigating } = usePageTransition()
  const [showVerification, setShowVerification] = useState(false)
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

    // Use standardized theme colors
  const buttonColor = "hsl(var(--primary))"
  const bgGradient = "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-hover)))"
  const iconBgColor = "hsl(var(--primary-foreground))"
  const linkColor = "hsl(var(--primary))"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // First attempt regular sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Check if user has 2FA enabled
      const userSettingsDoc = await getDoc(doc(db, "userSettings", user.uid))
      const has2faEnabled = userSettingsDoc.exists() && userSettingsDoc.data()?.twoFactorEnabled === true
      
      if (has2faEnabled) {
        // Store reference to user and credentials for 2FA
        setPendingUser({
          ...user,
          email,
          password
        })
        
        // Sign out temporarily until 2FA is verified
        await auth.signOut()
        
        // Send 2FA code to user's email
        const send2faCode = httpsCallable(functions, 'send2faCode')
        await send2faCode({ email })
        
        // Show verification input
        setShowVerification(true)
      } else {
        // No 2FA, proceed to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "Firebase: Error (auth/user-not-found).":
          case "Firebase: Error (auth/wrong-password).":
            setError("Invalid credentials")
            break
          case "Firebase: Error (auth/network-request-failed).":
            setError("Network error")
            break
          default:
            setError("Unexpected error")
        }
      } else {
        setError("Unexpected error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (code: string) => {
    try {
      // First sign in again
      await signInWithEmailAndPassword(auth, pendingUser.email, pendingUser.password)
      
      // Then verify the 2FA code
      const verify2faCode = httpsCallable(functions, 'verify2faCode')
      await verify2faCode({ code })
      
      // No need for explicit navigation - the verification component handles this
      return Promise.resolve()
    } catch (err) {
      if (err instanceof Error) {
        setVerificationError(err.message)
      } else {
        setVerificationError("An unexpected error occurred")
      }
      return Promise.reject(err)
    }
  }

  const handleResendCode = async () => {
    try {
      const send2faCode = httpsCallable(functions, 'send2faCode')
      await send2faCode({ email: pendingUser.email })
      setVerificationError(null)
      return Promise.resolve()
    } catch (err) {
      if (err instanceof Error) {
        setVerificationError(err.message)
      } else {
        setVerificationError("An unexpected error occurred")
      }
      return Promise.reject(err)
    }
  }

  if (showVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <VerificationCodeInput
          email={pendingUser?.email || ""}
          onVerify={handleVerify}
          onResend={handleResendCode}
          error={verificationError || undefined}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="h-2" style={{ background: bgGradient }} />

        <CardHeader className="space-y-1 pt-6 pb-4">
          <div className="flex justify-center mb-2">
            <div className="rounded-full p-2" style={{ backgroundColor: iconBgColor }}>
              <LogIn className="h-8 w-8" style={{ color: buttonColor }} />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight dark:text-white">Login</h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Enter your credentials</p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 mb-4">
              <p className="flex items-center text-sm font-medium text-red-800 dark:text-red-400">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">
                Email
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  className="h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium dark:text-gray-300">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: linkColor }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.querySelector("form")?.requestSubmit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button
            type="submit"
            className={`w-full text-white ${isNavigating ? 'navigation-active' : ''}`}
            style={{ backgroundColor: buttonColor }}
            disabled={isLoading || isNavigating}
            onClick={() => document.querySelector("form")?.requestSubmit()}
          >
            {isLoading || isNavigating ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center">
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Don't have an account?</span>{" "}
            <Link href="/signup" className="font-medium transition-colors" style={{ color: linkColor }}>
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}