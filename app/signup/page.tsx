"use client"

import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { VerificationCodeInput } from "@/app/components/auth/VerificationCodeInput"
import { useState, useEffect } from "react"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { setDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, ArrowRight, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePageTransition } from "../components/common/PageTransitionProvider"

import { useTranslation } from "react-i18next"

export default function SignupPage() {
  const router = useRouter()
  const { isNavigating } = usePageTransition()
  const [showVerification, setShowVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [pendingPassword, setPendingPassword] = useState("")
  const [pendingName, setPendingName] = useState("")
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'musician'
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { t } = useTranslation(['auth', 'common'])

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

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      // Store the signup data for later use
      setPendingEmail(email)
      setPendingPassword(password)
      setPendingName(name || "")
      
      // Send verification code
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode')
      await sendVerificationCode({ email })
      
      // Show verification input
      setShowVerification(true)
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "Firebase: Error (auth/email-already-in-use).":
            setError("Email is already in use")
            break
          case "Firebase: Error (auth/invalid-email).":
            setError("Invalid email address")
            break
          case "Firebase: Password should be at least 6 characters (auth/weak-password).":
            setError("Password should be at least 6 characters")
            break
          case "Firebase: Error (auth/network-request-failed).":
            setError("Network request failed")
            break
          default:
            setError("An unexpected error occurred")
        }
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (code: string) => {
    try {
      // Verify the code
      const verifyCode = httpsCallable(functions, 'verifyCode')
      await verifyCode({ email: pendingEmail, code })

      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, pendingEmail, pendingPassword)
      await updateProfile(userCredential.user, { displayName: pendingName })

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: pendingName,
        email: pendingEmail,
        bio: "",
        createdAt: new Date(),
        followers: [],
        following: []
      })
      
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
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode')
      await sendVerificationCode({ email: pendingEmail })
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#4A1D2C]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#6A2D3C]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8A3D4C]/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Back button for verification screen */}
        <Button
          variant="ghost"
          onClick={() => setShowVerification(false)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <VerificationCodeInput
          email={pendingEmail}
          onVerify={handleVerify}
          onResend={handleResendCode}
          error={verificationError || undefined}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#4A1D2C]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#6A2D3C]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8A3D4C]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="w-full max-w-md overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700 relative z-10">
        <div className="h-2" style={{ background: bgGradient }} />

        <CardHeader className="space-y-1 pt-6 pb-4">
          <div className="flex justify-center mb-2">
            <div className="rounded-full p-2" style={{ backgroundColor: iconBgColor }}>
              <UserPlus className="h-8 w-8" style={{ color: buttonColor }} />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight dark:text-white">Sign Up</h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Create an account to get started</p>
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
              <Label htmlFor="name" className="text-sm font-medium dark:text-gray-300">
                Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="h-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
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

            <Button
              type="submit"
              className={`w-full text-white ${isNavigating ? 'navigation-active' : ''}`}
              style={{ backgroundColor: buttonColor }}
              disabled={isLoading || isNavigating}
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
                  Signing up...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: linkColor }}
            >
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}