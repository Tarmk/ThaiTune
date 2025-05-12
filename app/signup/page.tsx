"use client"

import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AuthForm } from "@/app/components/AuthForm"

export default function SignupPage() {
  const router = useRouter()

  const handleSignup = async ({ email, password, name }: { email: string; password: string; name?: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        await updateProfile(userCredential.user, { displayName: name })
      }
      router.push("/dashboard")
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
