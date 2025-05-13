"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Switch } from "@/app/components/ui/switch"
import { Separator } from "@/app/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert"
import { auth, db, functions } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { ProtectedRoute } from "@/app/components/protectedroute"
import { TopMenu } from "@/app/components/TopMenu"
import { useTranslation } from "react-i18next"
import { httpsCallable } from "firebase/functions"
import { VerificationCodeInput } from "@/app/components/VerificationCodeInput"

export default function SettingsPage() {
  const [user, setUser] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [is2faEnabled, setIs2faEnabled] = React.useState(false)
  const [is2faToggling, setIs2faToggling] = React.useState(false)
  const [showVerification, setShowVerification] = React.useState(false)
  const [verificationError, setVerificationError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const router = useRouter()
  const { t } = useTranslation()

  // Fetch user and 2FA settings
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const get2faSettings = httpsCallable<any, { twoFactorEnabled: boolean }>(functions, 'get2faSettings')
          const result = await get2faSettings({})
          setIs2faEnabled(result.data.twoFactorEnabled)
        } catch (error) {
          console.error("Error fetching 2FA settings:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Handle 2FA toggle
  const handle2faToggle = async () => {
    setSuccess(null)
    
    if (!is2faEnabled) {
      // Enable 2FA - show verification first
      try {
        setIs2faToggling(true)
        const send2faCode = httpsCallable(functions, 'send2faCode')
        await send2faCode({ email: user.email })
        setShowVerification(true)
      } catch (error) {
        console.error("Error sending 2FA code:", error)
        setVerificationError("Failed to send verification code. Please try again.")
      } finally {
        setIs2faToggling(false)
      }
    } else {
      // Disable 2FA - direct update
      try {
        setIs2faToggling(true)
        const update2faSettings = httpsCallable(functions, 'update2faSettings')
        await update2faSettings({ enabled: false })
        setIs2faEnabled(false)
        setSuccess("Two-factor authentication has been disabled")
        setTimeout(() => setSuccess(null), 3000)
      } catch (error) {
        console.error("Error disabling 2FA:", error)
      } finally {
        setIs2faToggling(false)
      }
    }
  }

  // Handle verification code submission
  const handleVerify = async (code: string) => {
    try {
      // Verify the code
      const verify2faCode = httpsCallable(functions, 'verify2faCode')
      await verify2faCode({ code })
      
      // Enable 2FA
      const update2faSettings = httpsCallable(functions, 'update2faSettings')
      await update2faSettings({ enabled: true })
      
      // Update UI
      setIs2faEnabled(true)
      setShowVerification(false)
      setSuccess("Two-factor authentication has been enabled")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      if (error instanceof Error) {
        setVerificationError(error.message)
      } else {
        setVerificationError("Failed to verify code. Please try again.")
      }
    }
  }

  // Handle resend code
  const handleResendCode = async () => {
    try {
      const send2faCode = httpsCallable(functions, 'send2faCode')
      await send2faCode({ email: user.email })
      setVerificationError(null)
    } catch (error) {
      if (error instanceof Error) {
        setVerificationError(error.message)
      } else {
        setVerificationError("Failed to resend code. Please try again.")
      }
    }
  }

  if (showVerification) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <VerificationCodeInput
          email={user?.email || ""}
          onVerify={handleVerify}
          onResend={handleResendCode}
          error={verificationError || undefined}
        />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <TopMenu user={user} />
        <main className="max-w-3xl mx-auto px-4 pt-20 pb-6">
          <div className="mb-6">
            <button onClick={() => router.back()} className="flex items-center text-[#800000] hover:underline">
              <ArrowLeft className="mr-2" />
              Back
            </button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#333333]">Account Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2">Profile Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Name</div>
                  <div>{user?.displayName || "Not set"}</div>
                  
                  <div className="text-gray-500">Email</div>
                  <div>{user?.email || "Not set"}</div>
                </div>
              </div>

              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Security</h3>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-[#800000]" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security when signing in</p>
                    </div>
                  </div>
                  <Switch
                    checked={is2faEnabled}
                    onCheckedChange={handle2faToggle}
                    disabled={isLoading || is2faToggling}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
} 