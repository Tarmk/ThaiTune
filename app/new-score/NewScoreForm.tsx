"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import Link from "next/link"
import { auth, db } from "@/lib/firebase"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { ProtectedRoute } from "@/app/components/auth/protectedroute"
import CreateNewScorePage2 from "./createNewScore"
import { TopMenu } from "@/app/components/layout/TopMenu"
import { useTranslation } from "react-i18next"
import { Button } from "@/app/components/ui/button"

export default function NewScoreForm() {
  const { t } = useTranslation("editor")
  const [user, setUser] = React.useState<any>(null)
  const [name, setName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showCreateScore, setShowCreateScore] = React.useState(false)
  const [sharing, setSharing] = React.useState("public")
  const router = useRouter()

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user) throw new Error(t("errors.loginRequired"))
      if (!name.trim()) throw new Error(t("errors.nameRequired"))

      const scoreData = {
        name: name.trim(),
        author: user.displayName || "Anonymous",
        modified: serverTimestamp(),
        userId: user.uid,
        sharing: sharing,
        flatid: "",
      }

      const docRef = await addDoc(collection(db, "scores"), scoreData)
      setShowCreateScore(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unexpected"))
    } finally {
      setIsLoading(false)
    }
  }

  if (showCreateScore) {
    return <CreateNewScorePage2 title={name} />
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F5F5]">
        <TopMenu user={user} />

        <main className="max-w-7xl mx-auto px-4 py-6 mt-16">
          <div className="mb-6">
            <Link href="/dashboard" className="flex items-center text-[#800000] hover:underline">
              <ArrowLeft className="mr-2" />
              {t("backToMyScores")}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#333333] mb-6 text-center">{t("createNewScore")}</h1>
          <Card className="w-full max-w-md mx-auto px-4 py-8">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                {error && <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="name">{t("scoreName")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("enterScoreName")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sharing">{t("sharingOption")}</Label>
                  <select
                    id="sharing"
                    value={sharing}
                    onChange={(e) => setSharing(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="public">{t("public")}</option>
                    <option value="private">{t("private")}</option>
                  </select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full shadow-sm font-medium transition-transform hover:scale-105" 
                  style={{ backgroundColor: "#4A1D2C", color: "white" }}
                  disabled={isLoading}
                >
                  {isLoading ? t("creating") : t("next")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
