"use client"

import * as React from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface VerificationCodeInputProps {
  email: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  error?: string
}

export function VerificationCodeInput({ email, onVerify, onResend, error }: VerificationCodeInputProps) {
  const [code, setCode] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isResending, setIsResending] = React.useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) return
    setIsLoading(true)
    try {
      await onVerify(code)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await onResend()
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={code.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend code"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 