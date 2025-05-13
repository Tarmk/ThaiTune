"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Logo } from "@/app/components/common/Logo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // The specific maroon color
  const maroonColor = "#4A1D2C"
  const maroonLighter = "#6A2D3C"
  const maroonLightest = "#F8F1F3"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "Firebase: Error (auth/user-not-found).":
            setError("No account found with this email address")
            break
          case "Firebase: Error (auth/invalid-email).":
            setError("Invalid email address")
            break
          case "Firebase: Error (auth/network-request-failed).":
            setError("Network error. Please try again")
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg">
        <div className="h-2" style={{ background: `linear-gradient(to right, ${maroonColor}, ${maroonLighter})` }} />

        <CardHeader className="space-y-1 pt-6 pb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full" style={{ backgroundColor: maroonLightest }}>
              <KeyRound size={40} className="text-primary" style={{ color: maroonColor }} />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight">Reset Password</h2>
          <p className="text-center text-sm text-gray-500">
            Enter your email to receive a password reset link
          </p>
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

          {success ? (
            <div className="rounded-md bg-green-50 p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-green-800 mb-1">Check your email</h3>
              <p className="text-sm text-green-700">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
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
                    className="h-10 border-gray-200"
                  />
                </div>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          {success ? (
            <Link href="/login" className="w-full">
              <Button
                className="w-full"
                style={{ backgroundColor: maroonColor }}
              >
                <span className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </span>
              </Button>
            </Link>
          ) : (
            <>
              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: maroonColor }}
                disabled={isLoading || !email}
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
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-500">Remember your password?</span>{" "}
                <Link href="/login" className="font-medium transition-colors" style={{ color: maroonColor }}>
                  Back to login
                </Link>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 