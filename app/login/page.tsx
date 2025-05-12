"use client"

import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AuthForm } from "@/app/components/AuthForm"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
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
