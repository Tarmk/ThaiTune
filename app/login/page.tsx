"use client"

import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, functions, db } from "@/lib/firebase"
import { AuthForm } from "@/app/components/AuthForm"
import { VerificationCodeInput } from "@/app/components/VerificationCodeInput"
import { useState } from "react"
import { httpsCallable } from "firebase/functions"
import { doc, getDoc } from "firebase/firestore"

export default function LoginPage() {
  const router = useRouter()
  const [showVerification, setShowVerification] = useState(false)
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
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
            throw new Error("Invalid credentials")
          case "Firebase: Error (auth/network-request-failed).":
            throw new Error("Network error")
          default:
            throw new Error("Unexpected error")
        }
      } else {
        throw new Error("Unexpected error")
      }
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
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
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      translations={{
        title: "Login",
        description: "Enter your credentials",
        submitButton: "Login",
        loadingText: "Logging in...",
        alternateActionText: "Don't have an account?",
        alternateActionLink: "/signup",
        alternateActionLinkText: "Sign up",
      }}
    />
  )
}
