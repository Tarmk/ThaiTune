"use client"

import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { VerificationCodeInput } from "@/app/components/VerificationCodeInput"
import { useState } from "react"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [showVerification, setShowVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [pendingPassword, setPendingPassword] = useState("")
  const [pendingName, setPendingName] = useState("")
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The specific maroon color
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"

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
      if (pendingName) {
        await updateProfile(userCredential.user, { displayName: pendingName })
      }
      
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
        <div className="h-2" style={{ background: `linear-gradient(to right, ${maroonColor}, ${maroonLighter})` }} />

        <CardHeader className="space-y-1 pt-6 pb-4">
          <div className="flex justify-center mb-2">
            <div className="rounded-full p-2" style={{ backgroundColor: maroonLightest }}>
              <UserPlus className="h-8 w-8" style={{ color: maroonColor }} />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight">Sign Up</h2>
          <p className="text-center text-sm text-gray-500">Create an account to get started</p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="rounded-md bg-red-50 p-3 mb-4">
              <p className="flex items-center text-sm font-medium text-red-800">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="h-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="h-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="h-10 border-gray-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
            className="w-full text-white"
            style={{ backgroundColor: maroonColor }}
            disabled={isLoading}
            onClick={() => document.querySelector("form")?.requestSubmit()}
          >
            {isLoading ? (
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
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-500">Already have an account?</span>{" "}
            <Link href="/login" className="font-medium transition-colors" style={{ color: maroonColor }}>
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}