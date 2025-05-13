"use client"

import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AuthForm } from "@/app/components/AuthForm"
import { VerificationCodeInput } from "@/app/components/VerificationCodeInput"
import { useState } from "react"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"

export default function SignupPage() {
  const router = useRouter()
  const [showVerification, setShowVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [pendingPassword, setPendingPassword] = useState("")
  const [pendingName, setPendingName] = useState("")
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const handleSignup = async ({ email, password, name }: { email: string; password: string; name?: string }) => {
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
            throw new Error("Email is already in use")
          case "Firebase: Error (auth/invalid-email).":
            throw new Error("Invalid email address")
          case "Firebase: Password should be at least 6 characters (auth/weak-password).":
            throw new Error("Password should be at least 6 characters")
          case "Firebase: Error (auth/network-request-failed).":
            throw new Error("Network request failed")
          default:
            throw new Error("An unexpected error occurred")
        }
      } else {
        throw new Error("An unexpected error occurred")
      }
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
      
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof Error) {
        setVerificationError(err.message)
      } else {
        setVerificationError("An unexpected error occurred")
      }
    }
  }

  const handleResendCode = async () => {
    try {
      const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode')
      await sendVerificationCode({ email: pendingEmail })
      setVerificationError(null)
    } catch (err) {
      if (err instanceof Error) {
        setVerificationError(err.message)
      } else {
        setVerificationError("An unexpected error occurred")
      }
    }
  }

  if (showVerification) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
    <AuthForm
      type="signup"
      onSubmit={handleSignup}
      translations={{
        title: "Sign Up",
        description: "Create an account to get started",
        submitButton: "Sign Up",
        loadingText: "Signing Up...",
        alternateActionText: "Already have an account?",
        alternateActionLink: "/login",
        alternateActionLinkText: "Log in",
      }}
    />
  )
}
